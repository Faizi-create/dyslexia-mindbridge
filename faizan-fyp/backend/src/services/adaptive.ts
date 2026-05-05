import { ExerciseModel, IExercise } from '@/models/Exercise';
import { generateJson } from './gemini';

interface Attempt {
  exerciseId: string;
  correct: boolean;
  timeSpentMs: number;
  timestamp: number;
}

interface LearnerProfile {
  readingLevel: number;
  phonicsScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  strengths: string[];
  challenges: string[];
  preferredLanguage: 'en' | 'ur';
}

export interface NextActivityInput {
  studentId: string;
  currentModule: 'phonics' | 'reading' | 'vocabulary' | 'pronunciation';
  language: 'en' | 'ur';
  recentAttempts: Attempt[];
  learnerProfile: LearnerProfile;
  currentLevel: number;
  excludeIds?: string[];
}

export interface NextActivityResult {
  exercise: IExercise | null;
  nextLevel: number;
  reason: string;
}

export async function pickNextActivity(input: NextActivityInput): Promise<NextActivityResult> {
  const window = input.recentAttempts.slice(-5);
  const correct = window.filter((a) => a.correct).length;
  const pct = window.length > 0 ? (correct / window.length) * 100 : 0;

  let nextLevel = input.currentLevel;
  let reason = 'Keep going at the current level.';
  if (window.length >= 3 && pct >= 90) {
    nextLevel = Math.min(5, input.currentLevel + 1);
    reason = 'Strong performance — leveling up.';
  } else if (window.length >= 3 && pct < 60) {
    nextLevel = Math.max(1, input.currentLevel - 1);
    reason = 'Dropping a level to rebuild confidence.';
  }

  const pool = await ExerciseModel.find({
    type: input.currentModule,
    language: input.language,
    difficulty: { $gte: Math.max(1, nextLevel - 1), $lte: Math.min(5, nextLevel + 1) },
    _id: { $nin: input.excludeIds ?? [] },
  }).limit(20);

  if (pool.length === 0) return { exercise: null, nextLevel, reason };

  // Optional AI re-ranking. Falls back to random pick if Gemini isn't available.
  const ai = await generateJson<{ pickIndex: number; reason: string }>({
    system:
      'You pick the most helpful next exercise for a dyslexic child aged 6-12. Respond strictly as JSON: { "pickIndex": number, "reason": string }. pickIndex is 0-based index into the provided pool.',
    user: JSON.stringify({
      learnerProfile: input.learnerProfile,
      recentAttempts: input.recentAttempts.slice(-5),
      nextLevel,
      pool: pool.map((e, i) => ({
        index: i,
        difficulty: e.difficulty,
        prompt: e.prompt.slice(0, 140),
        type: e.type,
      })),
    }),
  });

  if (ai && typeof ai.pickIndex === 'number' && ai.pickIndex >= 0 && ai.pickIndex < pool.length) {
    return { exercise: pool[ai.pickIndex], nextLevel, reason: ai.reason ?? reason };
  }

  const idx = Math.floor(Math.random() * pool.length);
  return { exercise: pool[idx], nextLevel, reason };
}

export interface InsightsInput {
  studentId: string;
  recentAttempts: Attempt[];
  learnerProfile: LearnerProfile;
}

export interface InsightsResult {
  masteryScore: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export async function generateInsights(input: InsightsInput): Promise<InsightsResult> {
  const total = input.recentAttempts.length;
  const correct = input.recentAttempts.filter((a) => a.correct).length;
  const mastery = total > 0 ? Math.round((correct / total) * 100) : 0;

  const ai = await generateJson<InsightsResult>({
    system:
      'You are a patient reading specialist for dyslexic children aged 6-12. Output strictly JSON with keys: masteryScore (number 0-100), strengths (string[]), challenges (string[]), recommendations (string[]). Be concrete, warm, and short — each bullet one sentence, no jargon.',
    user: JSON.stringify({
      attempts: input.recentAttempts.slice(-30),
      learnerProfile: input.learnerProfile,
    }),
  });

  if (ai && typeof ai.masteryScore === 'number') return ai;

  // Rule-based fallback
  const strengths: string[] = [];
  const challenges: string[] = [];
  if (input.learnerProfile.phonicsScore > 20) strengths.push('Letter-sound recognition is strong.');
  else if (input.learnerProfile.phonicsScore < 0) challenges.push('Phonics needs more practice.');
  if (input.learnerProfile.vocabularyScore > 20) strengths.push('Growing vocabulary quickly.');
  if (input.learnerProfile.pronunciationScore < 0) challenges.push('Pronunciation drills would help.');

  const recs: string[] = [];
  if (mastery < 60) recs.push('Repeat recent lessons at an easier level.');
  if (challenges.length > 0) recs.push(`Focus the next session on: ${challenges[0]}`);
  if (recs.length === 0) recs.push('Keep the current pace — solid progress!');

  return { masteryScore: mastery, strengths, challenges, recommendations: recs };
}
