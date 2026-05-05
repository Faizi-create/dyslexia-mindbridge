import { LearningSession, ExerciseType } from '@/types';

export interface ChildStats {
  sessions: number;
  exercises: number;
  correctExercises: number;
  streak: number;
  todayMs: number;
  weekMs: number;
  todayCount: number;
  masteryScore: number;
  moduleCorrect: Record<ExerciseType, number>;
  moduleAttempted: Record<ExerciseType, number>;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function computeConsecutiveStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayKey = toDateKey(today);
  const yestKey = toDateKey(yesterday);

  // Streak anchor: allow today OR yesterday so the streak doesn't reset mid-morning.
  let cursor = set.has(todayKey) ? today : set.has(yestKey) ? yesterday : null;
  if (!cursor) return 0;

  let streak = 0;
  while (set.has(toDateKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

export function computeChildStats(sessions: LearningSession[]): ChildStats {
  const now = new Date();
  const todayKey = toDateKey(now);
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  let exercises = 0;
  let correct = 0;
  let todayMs = 0;
  let weekMs = 0;
  let todayCount = 0;

  const moduleCorrect: Record<ExerciseType, number> = {
    phonics: 0,
    reading: 0,
    vocabulary: 0,
    pronunciation: 0,
  };
  const moduleAttempted: Record<ExerciseType, number> = {
    phonics: 0,
    reading: 0,
    vocabulary: 0,
    pronunciation: 0,
  };

  for (const s of sessions) {
    exercises += s.exercisesCompleted;
    correct += s.correctCount;
    if (s.date === todayKey) {
      todayMs += s.totalTimeMs;
      todayCount += s.exercisesCompleted;
    }
    if (s.startedAt >= weekAgo) weekMs += s.totalTimeMs;

    for (const a of s.attempts) {
      const prefix = a.exerciseId.split('-')[0];
      const mod =
        prefix === 'ph' || prefix === 'phonics'
          ? 'phonics'
          : prefix === 're' || prefix === 'reading'
            ? 'reading'
            : prefix === 'vo' || prefix === 'vocabulary'
              ? 'vocabulary'
              : prefix === 'pr' || prefix === 'pronunciation'
                ? 'pronunciation'
                : null;
      if (mod) {
        moduleAttempted[mod] += 1;
        if (a.correct) moduleCorrect[mod] += 1;
      }
    }
  }

  const streak = computeConsecutiveStreak(sessions.map((s) => s.date));
  const mastery = exercises > 0 ? Math.round((correct / exercises) * 100) : 0;

  return {
    sessions: sessions.length,
    exercises,
    correctExercises: correct,
    streak,
    todayMs,
    weekMs,
    todayCount,
    masteryScore: mastery,
    moduleCorrect,
    moduleAttempted,
  };
}
