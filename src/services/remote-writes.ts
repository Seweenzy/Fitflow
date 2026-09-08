import { SupabaseClient } from '@supabase/supabase-js';
import { Preferences, User, WorkoutSession } from '@/types/fitflow';

export type WriteResult = { ok: true } | { ok: false; error: string };

type ProfilePatch = {
  name: string;
  goals: User['goals'];
  experience: User['experience'] | null;
  preference: User['preference'] | null;
  frequency: string | null;
  age: string | null;
  height: string | null;
  weight: string | null;
  gender: string | null;
  preferences: Preferences;
};

export async function updateRemoteProfile(
  client: SupabaseClient,
  userId: string,
  user: User,
  preferences: Preferences,
): Promise<WriteResult> {
  const { data, error } = await client
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
    } satisfies ProfilePatch)
    .eq('id', userId)
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'Your profile could not be saved.' };
  return { ok: true };
}

export async function insertRemoteSession(
  client: SupabaseClient,
  userId: string,
  session: WorkoutSession,
): Promise<WriteResult> {
  const { error } = await client.from('workout_sessions').insert({
    id: session.id,
    user_id: userId,
    workout_id: session.workoutId,
    started_at: session.startedAt,
    completed_at: session.completedAt,
    duration: session.duration,
    calories: session.calories,
    completed_exercises: session.completedExercises,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
