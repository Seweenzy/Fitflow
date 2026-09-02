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
  loadState,
  saveState,
} from '@/services/storage';
import {
  getSupabaseClient,
  setSupabaseSessionFromUrl,
} from '@/services/supabase';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { loadRemoteState } from '@/services/remote-state';
import {
  ActiveWorkout,
  WorkoutSession,
} from '@/types/fitflow';

type AuthResult = { error?: string; requiresEmailConfirmation?: boolean };
type AppContextValue = AppState & {
  ready: boolean;
  initializationError: string | null;
  retryInitialization: () => void;
  update: (patch: Partial<AppState>) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  completeSession: (session: WorkoutSession) => Promise<void>;
  setActiveWorkout: (workout: ActiveWorkout | null) => void;
  disableReminders: () => void;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

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
        const next = data.session
          ? await loadRemoteState(supabase, data.session, local)
          : { ...local, authenticated: false };
        if (active) {
          setState(next);
          setInitializationError(null);
        }
      } catch (error) {
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

  const update = async (patch: Partial<AppState>) => {
    setState((current) => ({ ...current, ...patch }));
    const { data } = await getSupabaseClient().auth.getSession();
    if (!data.session || (!patch.user && !patch.preferences)) return;

    const user = patch.user ?? state.user;
    const preferences = patch.preferences ?? state.preferences;
    if (!user) return;
    await getSupabaseClient()
      .from('profiles')
      .update({
        name: user.name,
        goals: user.goals,
        experience: user.experience ?? null,
        preference: user.preference ?? null,
        frequency: user.frequency ?? null,
        age: user.age ?? null,
        height: user.height ?? null,
        weight: user.weight ?? null,
        gender: user.gender ?? null,
        preferences,
      })
      .eq('id', data.session.user.id);
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

  const completeSession = async (session: WorkoutSession) => {
    setState((current) => ({
      ...current,
      sessions: [session, ...current.sessions],
    }));
    const { data } = await getSupabaseClient().auth.getSession();
    if (!data.session) return;
    await getSupabaseClient().from('workout_sessions').insert({
      id: session.id,
      user_id: data.session.user.id,
      workout_id: session.workoutId,
      started_at: session.startedAt,
      completed_at: session.completedAt,
      duration: session.duration,
      calories: session.calories,
      completed_exercises: session.completedExercises,
    });
  };
  const setActiveWorkout = (activeWorkout: ActiveWorkout | null) =>
    setState((current) => ({ ...current, activeWorkout }));
  const disableReminders = () =>
    void update({
      preferences: { ...state.preferences, notifications: false },
    });
  const signOut = async () => {
    await getSupabaseClient().auth.signOut();
    setState((current) => ({ ...current, authenticated: false }));
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
