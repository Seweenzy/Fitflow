import { Session, SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/types/fitflow';

export type AuthResult = {
  error?: string;
  session?: Session;
  requiresEmailConfirmation?: boolean;
};

export async function signUpWithEmail(
  client: SupabaseClient,
  input: {
    name: string;
    email: string;
    password: string;
    profile: User | null;
  },
): Promise<AuthResult> {
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { ...input.profile, name: input.name } },
  });
  if (error) return { error: error.message };
  if (!data.session) return { requiresEmailConfirmation: true };
  return { session: data.session };
}

export async function signInWithEmail(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };
  return { session: data.session };
}
