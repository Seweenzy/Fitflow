import { expect, jest, describe, it } from '@jest/globals';
import { initialState } from './storage';
import { loadRemoteState, mapRemoteState } from './remote-state';

jest.mock('@react-native-async-storage/async-storage', () =>
  // The package exposes its Jest mock through CommonJS.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const session = {
  user: {
    id: 'user-1',
    email: 'jordan@example.com',
    user_metadata: { name: 'Jordan Lee' },
  },
} as any;

describe('authenticated remote state', () => {
  it('maps the authenticated profile and sessions into app state', () => {
    const state = mapRemoteState(
      session,
      initialState,
      {
        name: 'Jordan Lee',
        goals: ['Build muscle'],
        experience: 'Intermediate',
        preference: 'Gym',
        frequency: '4 days',
        age: '31',
        height: '180',
        weight: '82',
        gender: 'Prefer not to say',
        preferences: { ...initialState.preferences, theme: 'dark' },
      },
      [
        {
          id: 'session-1',
          workout_id: 'upper-body-strength',
          started_at: '2026-08-26T08:00:00.000Z',
          completed_at: '2026-08-26T08:30:00.000Z',
          duration: 30,
          calories: 240,
          completed_exercises: 4,
        },
      ],
    );

    expect(state.authenticated).toBe(true);
    expect(state.user?.name).toBe('Jordan Lee');
    expect(state.user?.goals).toEqual(['Build muscle']);
    expect(state.preferences.theme).toBe('dark');
    expect(state.sessions[0]).toMatchObject({
      workoutId: 'upper-body-strength',
      completedExercises: 4,
    });
  });

  it('loads an authenticated profile and session list through RLS-scoped queries', async () => {
    const profile = {
      name: 'Jordan Lee',
      goals: ['Stay active'],
      preferences: initialState.preferences,
    };
    const sessions: unknown[] = [];
    const supabase = {
      from: jest.fn((table: string) =>
        table === 'profiles'
          ? {
              select: () => ({
                eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }),
              }),
            }
          : {
              select: () => ({
                eq: () => ({
                  order: async () => ({ data: sessions, error: null }),
                }),
              }),
            },
      ),
    } as any;

    const state = await loadRemoteState(supabase, session, initialState);
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from).toHaveBeenCalledWith('workout_sessions');
    expect(state.user?.email).toBe('jordan@example.com');
    expect(state.sessions).toEqual([]);
  });

  it('fails when the authenticated profile query fails', async () => {
    const supabase = {
      from: jest.fn((table: string) =>
        table === 'profiles'
          ? {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: null,
                    error: { message: 'permission denied' },
                  }),
                }),
              }),
            }
          : {
              select: () => ({
                eq: () => ({
                  order: async () => ({ data: [], error: null }),
                }),
              }),
            },
      ),
    } as any;

    await expect(loadRemoteState(supabase, session, initialState)).rejects.toThrow(
      'Unable to load your profile: permission denied',
    );
  });
});
