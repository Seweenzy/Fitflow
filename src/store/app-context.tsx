import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Linking } from 'react-native';
import {
  AppState,
  initialState,
  clearUserState,
  loadState,
  saveState,
} from '@/services/storage';
import {
  getSupabaseClient,
  setSupabaseSessionFromUrl,
} from '@/services/supabase';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { loadRemoteState } from '@/services/remote-state';
import { insertRemoteSession, updateRemoteProfile } from '@/services/remote-writes';
import { reportOperationalError } from '@/services/observability';
import {
  ActiveWorkout,
  WorkoutSession,
} from '@/types/fitflow';

type AuthResult = { error?: string; requiresEmailConfirmation?: boolean };
type OperationResult = { ok: true } | { ok: false; error: string };type AppContextValue = AppState & {
  ready: boolean;
  initializationError: string | null;
  retryInitialization: () => void;
  update: (patch: Partial<AppState>) => Promise<OperationResult>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  completeSession: (session: WorkoutSession) => Promise<OperationResult>;
  setActiveWorkout: (workout: ActiveWorkout | null) => void;
  disableReminders: () => void;
  signOut: () => Promise<OperationResult>;
};

const AppContext = createContext<AppContextValue | null>(null);

function isTokenClockError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('jwt issued at future') || message.includes('iat');
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [initializationAttempt, setInitializationAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const supabase = getSupabaseClient();
        const local = await loadState();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        let session = data.session;
        if (session) {
          try {
            const next = await loadRemoteState(supabase, session, local);
            if (active) {
              setState(next);
              setInitializationError(null);
            }
            return;
          } catch (sessionError) {
            if (!isTokenClockError(sessionError) || !active) throw sessionError;
            const refreshed = await supabase.auth.refreshSession();
            if (refreshed.error || !refreshed.data.session) {
              await supabase.auth.signOut();
              if (active) {
                setState({ ...local, authenticated: false });
              }
              reportOperationalError('app_session_refresh_failed', refreshed.error ?? sessionError);
              return;
            }
            session = refreshed.data.session;
          }
        }
        const next = session
          ? await loadRemoteState(supabase, session, local)
          : { ...local, authenticated: false };
        if (active) {
          setState(next);
          setInitializationError(null);
        }
      } catch (error) {
        reportOperationalError('app_initialization_failed', error);
        if (active) {
          setInitializationError(
            error instanceof Error
              ? error.message
              : 'Unable to connect to FitFlow.',
          );
        }
      } finally {
        if (active) setReady(true);
      }
    };

    const handleUrl = async (url: string) => {
      try {
        const supabase = getSupabaseClient();
        const result = await setSupabaseSessionFromUrl(url);
        if (result?.data.session && active) {
          const local = await loadState();
          setState(await loadRemoteState(supabase, result.data.session, local));
          setInitializationError(null);
        }
      } catch (error) {
        reportOperationalError('auth_link_restore_failed', error);
        if (active) {
          setInitializationError(
            error instanceof Error
              ? error.message
              : 'Unable to restore your session.',
          );
        }
      }
    };

    void initialize();
    void Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });
    let authSubscription: {
      subscription: { unsubscribe: () => void };
    } | null = null;
    try {
      authSubscription = getSupabaseClient().auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT' && active) {
          setState((current) => ({ ...current, authenticated: false }));
        }
      }).data;
    } catch {
      // Initialization reports configuration errors through its own state.
    }

    return () => {
      active = false;
      linkSubscription.remove();
      authSubscription?.subscription.unsubscribe();
    };
  }, [initializationAttempt]);

  useEffect(() => {
    if (ready) void saveState(state);
  }, [state, ready]);

  const update = async (patch: Partial<AppState>): Promise<OperationResult> => {
    const next = { ...state, ...patch };
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) return { ok: false, error: error.message };
    if (!data.session || (!patch.user && !patch.preferences)) {
      setState(next);
      return { ok: true };
    }

    if (!next.user) return { ok: false, error: 'A profile is required to save changes.' };
    const result = await updateRemoteProfile(
      getSupabaseClient(),
      data.session.user.id,
      next.user,
      next.preferences,
    );
    if (!result.ok) {
      reportOperationalError('profile_sync_failed', result.error, {
        operation: 'update_profile',
      });
      return result;
    }
    setState(next);
    return { ok: true };
  };

  const signUp = async (name: string, email: string, password: string) => {
    const supabase = getSupabaseClient();
    const result = await signUpWithEmail(supabase, {
      name,
      email,
      password,
      profile: state.user,
    });
    if (result.error || result.requiresEmailConfirmation) return result;

    try {
      setState(await loadRemoteState(supabase, result.session!, state));
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unable to load profile.',
      };
    }
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const result = await signInWithEmail(supabase, email, password);
    if (result.error) return result;

    try {
      setState(await loadRemoteState(supabase, result.session!, state));
    } catch (error) {
      await supabase.auth.signOut();
      return {
        error: error instanceof Error ? error.message : 'Unable to load profile.',
      };
    }
    return {};
  };

  const completeSession = async (session: WorkoutSession): Promise<OperationResult> => {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: false, error: 'Your session has expired. Please sign in again.' };
    const result = await insertRemoteSession(
      getSupabaseClient(),
      data.session.user.id,
      session,
    );
    if (!result.ok) {
      reportOperationalError('workout_sync_failed', result.error, {
        operation: 'insert_session',
      });
      return result;
    }
    setState((current) => ({ ...current, sessions: [session, ...current.sessions] }));
    return { ok: true };
  };
  const setActiveWorkout = (activeWorkout: ActiveWorkout | null) =>
    setState((current) => ({ ...current, activeWorkout }));
  const disableReminders = () =>
    void update({
      preferences: { ...state.preferences, notifications: false },
    });
  const signOut = async (): Promise<OperationResult> => {
    const { error } = await getSupabaseClient().auth.signOut();
    const cleared = clearUserState();
    setState(cleared);
    await saveState(cleared);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        ready,
        initializationError,
        retryInitialization: () => {
          setReady(false);
          setInitializationError(null);
          setInitializationAttempt((attempt) => attempt + 1);
        },
        update,
        signUp,
        signIn,
        completeSession,
        setActiveWorkout,
        disableReminders,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
