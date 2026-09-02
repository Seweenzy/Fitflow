export type Goal =
  | 'Lose weight'
  | 'Build muscle'
  | 'Improve fitness'
  | 'Increase strength'
  | 'Improve flexibility'
  | 'Stay active';
export type Experience = 'Beginner' | 'Intermediate' | 'Advanced';
export type Preference = 'Home' | 'Gym' | 'Outdoor' | 'Anywhere';
export type Difficulty = Experience;

export type Exercise = {
  id: string;
  name: string;
  prescription: string;
  detail: string;
  duration?: number;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: Difficulty;
  calories: number;
  targetMuscles: string[];
  equipment: string;
  category: string;
  accent: string;
  exercises: Exercise[];
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  calories: number;
  completedExercises: number;
};
export type ActiveWorkout = {
  workoutId: string;
  exerciseIndex: number;
  completedExercises: string[];
  startedAt: string;
  elapsedSeconds: number;
  paused: boolean;
  restSeconds: number | null;
};

export type Preferences = {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  notifications: boolean;
  reminderTime: string;
  workoutDays: number[];
};
export type User = {
  name: string;
  email: string;
  goals: Goal[];
  experience?: Experience;
  preference?: Preference;
  frequency?: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
};
