import { Session, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from '@/services/storage';
import { Preferences, User } from '@/types/fitflow';

type RemoteProfile = {
  name: string;
  goals: User['goals'];
  experience: User['experience'] | null;
  preference: User['preference'] | null;
  frequency: string | null;
  age: string | null;
  height: string | null;
  weight: string | null;
  gender: string | null;
  preferences: Preferences | null;
};

type RemoteSession = {
  id: string;
  workout_id: string;
  started_at: string;
  completed_at: string;
  duration: number;
  calories: number;
  completed_exercises: number;
};

export function mapRemoteState(
  session: Session,
  local: AppState,
  profile: RemoteProfile | null,
  sessions: RemoteSession[],
): AppState {
  const metadata = session.user.user_metadata;
  const user: User = {
    name: profile?.name ?? metadata.name ?? 'FitFlow Member',
    email: session.user.email ?? '',
    goals: profile?.goals ?? metadata.goals ?? [],
    experience: profile?.experience ?? metadata.experience,
    preference: profile?.preference ?? metadata.preference,
    frequency: profile?.frequency ?? metadata.frequency,
    age: profile?.age ?? metadata.age,
    height: profile?.height ?? metadata.height,
    weight: profile?.weight ?? metadata.weight,
    gender: profile?.gender ?? metadata.gender,
  };

  return {
    ...local,
    authenticated: true,
    onboarded: true,
    user,
    preferences: profile?.preferences ?? local.preferences,
    sessions: sessions.map((item) => ({
      id: item.id,
      workoutId: item.workout_id,
      startedAt: item.started_at,
      completedAt: item.completed_at,
      duration: item.duration,
      calories: item.calories,
      completedExercises: item.completed_exercises,
    })),
  };
}

export async function loadRemoteState(
  client: SupabaseClient,
  session: Session,
  local: AppState,
): Promise<AppState> {
  const [profileResult, sessionsResult] = await Promise.all([
    client.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
    client
      .from('workout_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('completed_at', { ascending: false }),
  ]);
  if (profileResult.error) {
    throw new Error(`Unable to load your profile: ${profileResult.error.message}`);
  }
  if (sessionsResult.error) {
    throw new Error(
      `Unable to load your workout history: ${sessionsResult.error.message}`,
    );
  }

  return mapRemoteState(
    session,
    local,
    profileResult.data as RemoteProfile | null,
    (sessionsResult.data ?? []) as RemoteSession[],
  );
}
