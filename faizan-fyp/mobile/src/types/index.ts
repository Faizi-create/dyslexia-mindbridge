export type UserRole = 'parent' | 'child' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export type Language = 'en' | 'ur';

export interface LearnerProfile {
  readingLevel: number;
  phonicsScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  strengths: string[];
  challenges: string[];
  preferredLanguage: Language;
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  grade?: string;
  avatarIndex: number;
  learnerProfile: LearnerProfile;
  currentLevel: number;
  dailyTimeLimitMinutes: number;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    audioHints: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export type ExerciseType = 'phonics' | 'reading' | 'vocabulary' | 'pronunciation';

export interface ExerciseOption {
  id: string;
  label: string;
  hint?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  language: Language;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  instruction?: string;
  options?: ExerciseOption[];
  correctOptionId?: string;
  targetWord?: string;
  targetSentence?: string;
  explanation?: string;
}

export interface ExerciseAttempt {
  exerciseId: string;
  correct: boolean;
  selectedOptionId?: string;
  timeSpentMs: number;
  timestamp: number;
}

export interface LearningSession {
  id?: string;
  studentId: string;
  date: string;
  startedAt: number;
  endedAt?: number;
  totalTimeMs: number;
  exercisesCompleted: number;
  correctCount: number;
  score: number;
  attempts: ExerciseAttempt[];
}

export interface ProgressReport {
  id: string;
  studentId: string;
  generatedAt: number;
  masteryScore: number;
  moduleScores: Record<ExerciseType, number>;
  insights: string[];
  recommendations: string[];
}

export type RootStackParamList = {
  Auth: undefined;
  Parent: undefined;
  Child: { childId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ChildSelection: undefined;
  CreateChild: undefined;
};

export type ParentStackParamList = {
  ParentDashboard: undefined;
  ChildSelection: undefined;
};

export type ParentTabsParamList = {
  Overview: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type ChildTabsParamList = {
  Home: undefined;
  Learn: undefined;
  Rewards: undefined;
};

export type ChildStackParamList = {
  Main: undefined;
  Exercise: { type: ExerciseType };
  Assessment: undefined;
};
