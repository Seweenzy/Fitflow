import { expect, jest, describe, it } from '@jest/globals';
import { insertRemoteSession, updateRemoteProfile } from './remote-writes';

const preferences = {
  theme: 'light' as const,
  units: 'metric' as const,
  notifications: false,
  reminderTime: '07:00',
  workoutDays: [1, 3, 5],
};

function profileClient(response: { data?: unknown; error?: { message: string } | null }) {
  const maybeSingle = jest.fn<any>().mockResolvedValue({
    data: response.data ?? null,
    error: response.error ?? null,
  });
  const select = jest.fn(() => ({ maybeSingle }));
  const eq = jest.fn(() => ({ select }));
  const update = jest.fn(() => ({ eq }));
  return { from: jest.fn(() => ({ update })), update, eq, select, maybeSingle } as any;
}

describe('remote writes', () => {
  it('reports profile update errors', async () => {
    const client = profileClient({ error: { message: 'permission denied' } });
    const result = await updateRemoteProfile(
      client,
      'user-1',
      { name: 'Jordan Lee', email: 'jordan@example.com', goals: [] },
      preferences,
    );
    expect(result).toEqual({ ok: false, error: 'permission denied' });
  });

  it('reports a missing profile row as a failed update', async () => {
    const client = profileClient({ data: null });
    const result = await updateRemoteProfile(
      client,
      'user-1',
      { name: 'Jordan Lee', email: 'jordan@example.com', goals: [] },
      preferences,
    );
    expect(result.ok).toBe(false);
  });

  it('reports workout insert errors', async () => {
    const client = {
      from: jest.fn(() => ({
        insert: jest.fn<any>().mockResolvedValue({ error: { message: 'insert failed' } }),
      })),
    } as any;
    const result = await insertRemoteSession(client, 'user-1', {
      id: 'session-1',
      workoutId: 'workout-1',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:30:00.000Z',
      duration: 30,
      calories: 100,
      completedExercises: 1,
    });
    expect(result).toEqual({ ok: false, error: 'insert failed' });
  });
});
