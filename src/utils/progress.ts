import { WorkoutSession } from '@/types/fitflow';
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
export function weeklyMinutes(sessions: WorkoutSession[]) {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const minutes = sessions
      .filter(
        (session) => dayKey(new Date(session.completedAt)) === dayKey(date),
      )
      .reduce((sum, session) => sum + session.duration, 0);
    return { label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index], minutes, date };
  });
}
export function currentStreak(sessions: WorkoutSession[]) {
  const days = new Set(
    sessions.map((session) => dayKey(new Date(session.completedAt))),
  );
  if (!days.size) return 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}
