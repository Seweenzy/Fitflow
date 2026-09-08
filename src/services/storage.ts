import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveWorkout, Preferences, User, WorkoutSession } from '@/types/fitflow';

const KEY = '@fitflow/state';
const VERSION = 1;
export type AppState = {
  user: User | null;
  sessions: WorkoutSession[];
  preferences: Preferences;
  onboarded: boolean;
  authenticated: boolean;
  activeWorkout: ActiveWorkout | null;
  version: number;
};
export const initialState: AppState = {
  user: null,
  sessions: [],
  preferences: {
    theme: 'light',
    units: 'metric',
    notifications: false,
    reminderTime: '07:00',
    workoutDays: [1, 3, 5],
  },
  onboarded: false,
  authenticated: false,
  activeWorkout: null,
  version: VERSION,
};
export function clearUserState(): AppState {
  return { ...initialState };
}
export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return normalizeState(parsed);
  } catch {
    return initialState;
  }
}
function normalizeState(value: Partial<AppState>): AppState {
  const preferences = value.preferences;
  return {
    ...initialState,
    ...value,
    user: value.user && typeof value.user === 'object' ? value.user : null,
    sessions: Array.isArray(value.sessions) ? value.sessions : [],
    preferences: {
      ...initialState.preferences,
      ...(preferences && typeof preferences === 'object' ? preferences : {}),
      workoutDays: Array.isArray(preferences?.workoutDays)
        ? preferences.workoutDays.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 7)
        : initialState.preferences.workoutDays,
    },
    activeWorkout: value.activeWorkout && typeof value.activeWorkout === 'object'
      ? value.activeWorkout
      : null,
    version: VERSION,
  };
}
export async function saveState(state: AppState): Promise<boolean> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
