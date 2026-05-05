import { env } from '@/config/env';
import { Exercise, ExerciseAttempt, ExerciseType, Language, LearnerProfile } from '@/types';
import { pickExercise } from '@/data/exercises';

/**
 * The backend owns the Gemini key in production. The mobile app calls backend
 * endpoints; if they're unreachable we fall back to local rule-based logic so
 * learning can continue offline.
 */

interface NextActivityRequest {
  studentId: string;
  currentModule: ExerciseType;
  language: Language;
  recentAttempts: ExerciseAttempt[];
  learnerProfile: LearnerProfile;
  currentLevel: number;
  excludeIds?: string[];
}

interface NextActivityResponse {
  exercise: Exercise | null;
  nextLevel: number;
  reason: string;
}

export async function requestNextActivity(params: NextActivityRequest): Promise<NextActivityResponse> {
  const rule = ruleBasedNextActivity(params);
  try {
    const res = await fetch(`${env.apiBaseUrl}/api/ai/next-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const data = (await res.json()) as NextActivityResponse;
    return data.exercise ? data : rule;
  } catch {
    return rule;
  }
}

function ruleBasedNextActivity(params: NextActivityRequest): NextActivityResponse {
  const { recentAttempts, currentLevel, currentModule, language, excludeIds } = params;
  const windowAttempts = recentAttempts.slice(-5);
  const correctCount = windowAttempts.filter((a) => a.correct).length;
  const pct = windowAttempts.length > 0 ? (correctCount / windowAttempts.length) * 100 : 0;

  let nextLevel = currentLevel;
  let reason = 'Keep going at the current level.';
  if (windowAttempts.length >= 3 && pct >= 90) {
    nextLevel = Math.min(5, currentLevel + 1);
    reason = 'Great streak! Moving up a level.';
  } else if (windowAttempts.length >= 3 && pct < 60) {
    nextLevel = Math.max(1, currentLevel - 1);
    reason = "Let's try an easier version to build confidence.";
  }

  const exercise = pickExercise({
    type: currentModule,
    language,
    level: nextLevel,
    excludeIds,
  });

  return { exercise, nextLevel, reason };
}

interface InsightsRequest {
  studentId: string;
  recentAttempts: ExerciseAttempt[];
  learnerProfile: LearnerProfile;
}

export interface AIInsights {
  masteryScore: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export async function requestInsights(params: InsightsRequest): Promise<AIInsights> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/api/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Backend unreachable');
    return (await res.json()) as AIInsights;
  } catch {
    return fallbackInsights(params);
  }
}

function fallbackInsights(params: InsightsRequest): AIInsights {
  const { recentAttempts, learnerProfile } = params;
  const total = recentAttempts.length;
  const correct = recentAttempts.filter((a) => a.correct).length;
  const mastery = total > 0 ? Math.round((correct / total) * 100) : 0;

  const strengths: string[] = [];
  const challenges: string[] = [];
  if (learnerProfile.phonicsScore > 20) strengths.push('Letter-sound recognition is strong.');
  else if (learnerProfile.phonicsScore < 0) challenges.push('Phonics needs more practice.');
  if (learnerProfile.vocabularyScore > 20) strengths.push('Growing vocabulary quickly.');
  if (learnerProfile.pronunciationScore < 0) challenges.push('Pronunciation drills would help.');

  const recs: string[] = [];
  if (mastery < 60) recs.push('Repeat recent lessons at an easier level.');
  if (challenges.length > 0) recs.push(`Focus the next session on: ${challenges[0]}`);
  if (recs.length === 0) recs.push('Keep the current pace — solid progress!');

  return { masteryScore: mastery, strengths, challenges, recommendations: recs };
}
