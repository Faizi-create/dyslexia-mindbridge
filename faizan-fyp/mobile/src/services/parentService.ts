import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { ChildProfile, LearningSession } from '@/types';

export interface ChildStats {
  todayMs: number;
  weekMs: number;
  masteryScore: number;
  exercisesToday: number;
  exercisesWeek: number;
  recentSkills: string[];
}

export function computeStats(sessions: LearningSession[]): ChildStats {
  const now = new Date();
  const today = toDateKey(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let todayMs = 0;
  let weekMs = 0;
  let exercisesToday = 0;
  let exercisesWeek = 0;
  let totalAttempts = 0;
  let correctAttempts = 0;
  const moduleHits: Record<string, number> = {};

  for (const s of sessions) {
    const isWeek = new Date(s.startedAt) >= weekAgo;
    const isToday = s.date === today;
    if (isWeek) {
      weekMs += s.totalTimeMs;
      exercisesWeek += s.exercisesCompleted;
      totalAttempts += s.attempts.length;
      correctAttempts += s.attempts.filter((a) => a.correct).length;
    }
    if (isToday) {
      todayMs += s.totalTimeMs;
      exercisesToday += s.exercisesCompleted;
    }
    for (const a of s.attempts) {
      if (a.correct) {
        const key = a.exerciseId.split('-')[0];
        moduleHits[key] = (moduleHits[key] ?? 0) + 1;
      }
    }
  }

  const mastery = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const recentSkills = Object.entries(moduleHits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([prefix]) => skillLabel(prefix));

  return {
    todayMs,
    weekMs,
    masteryScore: mastery,
    exercisesToday,
    exercisesWeek,
    recentSkills,
  };
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function skillLabel(prefix: string): string {
  switch (prefix) {
    case 'ph':
      return 'Phonics';
    case 'vo':
      return 'Vocabulary';
    case 're':
      return 'Reading';
    case 'pr':
      return 'Pronunciation';
    default:
      return prefix;
  }
}

export async function updateChildSettings(
  childId: string,
  patch: Partial<Pick<ChildProfile, 'dailyTimeLimitMinutes' | 'accessibility'>>,
): Promise<void> {
  await updateDoc(doc(firestore, 'students', childId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
