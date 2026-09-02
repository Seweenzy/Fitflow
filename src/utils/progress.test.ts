import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { currentStreak, dayKey, weeklyMinutes } from './progress';
import { WorkoutSession } from '@/types/fitflow';

function session(completedAt: Date, duration = 20): WorkoutSession {
  return {
    id: completedAt.toISOString(),
    workoutId: 'full-body-beginner',
    startedAt: new Date(completedAt.getTime() - duration * 60000).toISOString(),
    completedAt: completedAt.toISOString(),
    duration,
    calories: 100,
    completedExercises: 4,
  };
}

describe('progress utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 20, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the local calendar date as a day key', () => {
    expect(dayKey(new Date(2026, 7, 3, 23, 30))).toBe('2026-7-3');
  });

  it('totals sessions by weekday for the current week', () => {
    const monday = new Date(2026, 7, 17, 10);
    const thursday = new Date(2026, 7, 20, 10);
    const week = weeklyMinutes([
      session(monday, 15),
      session(monday, 10),
      session(thursday, 30),
    ]);

    expect(week.map((day) => day.minutes)).toEqual([25, 0, 0, 30, 0, 0, 0]);
  });

  it('counts a streak through today', () => {
    expect(
      currentStreak([
        session(new Date(2026, 7, 20, 9)),
        session(new Date(2026, 7, 19, 9)),
        session(new Date(2026, 7, 18, 9)),
      ]),
    ).toBe(3);
  });

  it('keeps a streak alive when the latest workout was yesterday', () => {
    expect(
      currentStreak([
        session(new Date(2026, 7, 19, 9)),
        session(new Date(2026, 7, 18, 9)),
      ]),
    ).toBe(2);
  });
});
