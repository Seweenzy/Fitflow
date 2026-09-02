import { expect, jest, describe, it } from '@jest/globals';
import { signInWithEmail, signUpWithEmail } from './auth';

function client() {
  return {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  } as any;
}

describe('Supabase auth service', () => {
  it('passes signup credentials and profile metadata to Supabase', async () => {
    const supabase = client();
    const session = { access_token: 'token' };
    supabase.auth.signUp.mockResolvedValue({
      data: { session },
      error: null,
    });

    await expect(
      signUpWithEmail(supabase, {
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        password: 'password123',
        profile: { name: 'Jordan Lee', email: '', goals: ['Stay active'] },
      }),
    ).resolves.toEqual({ session });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'jordan@example.com',
      password: 'password123',
      options: {
        data: {
          name: 'Jordan Lee',
          email: '',
          goals: ['Stay active'],
        },
      },
    });
  });

  it('requires confirmation when signup returns no session', async () => {
    const supabase = client();
    supabase.auth.signUp.mockResolvedValue({ data: { session: null }, error: null });

    await expect(
      signUpWithEmail(supabase, {
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        password: 'password123',
        profile: null,
      }),
    ).resolves.toEqual({ requiresEmailConfirmation: true });
  });

  it('returns Supabase sign-in errors without hiding them', async () => {
    const supabase = client();
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(
      signInWithEmail(supabase, 'jordan@example.com', 'wrong-password'),
    ).resolves.toEqual({ error: 'Invalid login credentials' });
  });
});
