export type View = 'dashboard' | 'generator' | 'weekly' | 'workout-detail' | 'profile' | 'feedback' | 'auth' | 'biotypes' | 'feed' | 'coach' | 'vip' | 'rewards' | 'admin' | 'legal' | 'exercises' | 'match' | 'trainer-dashboard' | 'workout-builder';
export type Level = 'Iniciante' | 'Praticante' | 'Intermediário' | 'Avançado' | 'Elite';
export type Biotype = 'Ectomorfo' | 'Mesomorfo' | 'Endomorfo';
export type RadioQuality = 'low' | 'high';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  age?: number;
  profileImage?: string;
  isPremium: boolean;
  isAdmin: boolean;
  role?: 'student' | 'trainer';
  experience_level?: string;
  latitude?: number;
  longitude?: number;
  is_searching_partner?: boolean;
  partner_bio?: string;
  is_invisible?: boolean;
  privacy_level?: 'full' | 'anonymous';
  trainerEmail?: string;
  cref?: string;
  cref_status?: 'active' | 'pending';
  last_activity?: string;
  trained_today?: boolean;
  is_blocked?: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  videoUrl: string;
  imageUrl: string;
  recommendedWeight: string;
  musclesWorked: string[];
  instructions: string[];
  exerciseTips: string[];
  equipments: string[];
  overview: string;
}

export interface Workout {
  title: string;
  muscleGroup: string;
  level: string;
  exercises: WorkoutExercise[];
  tips: string[];
}

export interface PerformedSet {
  reps: number;
  weight: number;
}

export interface PerformedExercise {
  name: string;
  sets: PerformedSet[];
}

export interface WorkoutLog {
  id: string;
  date: number;
  workoutTitle: string;
  exercises: PerformedExercise[];
}

export interface Achievement {
  id: number;
  type: string;
  unlocked_at: string;
}
