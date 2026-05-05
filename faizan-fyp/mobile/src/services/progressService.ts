import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { ExerciseAttempt, ExerciseType, LearningSession } from '@/types';
import { enqueueOfflineAttempt } from './offlineQueue';

const SESSIONS = 'learningSessions';
const STUDENTS = 'students';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function startSession(studentId: string): Promise<string> {
  const ref = await addDoc(collection(firestore, SESSIONS), {
    studentId,
    date: todayKey(),
    startedAt: serverTimestamp(),
    totalTimeMs: 0,
    exercisesCompleted: 0,
    correctCount: 0,
    score: 0,
    attempts: [],
  });
  return ref.id;
}

export async function recordAttempt(params: {
  sessionId: string;
  studentId: string;
  attempt: ExerciseAttempt;
  moduleType: ExerciseType;
}): Promise<void> {
  const { sessionId, studentId, attempt, moduleType } = params;
  try {
    const ref = doc(firestore, SESSIONS, sessionId);
    const snap = await getDoc(ref);
    const existing = (snap.data()?.attempts ?? []) as ExerciseAttempt[];
    await updateDoc(ref, {
      attempts: [...existing, attempt],
      exercisesCompleted: increment(1),
      correctCount: increment(attempt.correct ? 1 : 0),
      totalTimeMs: increment(attempt.timeSpentMs),
    });
    await bumpLearnerScore(studentId, moduleType, attempt.correct);
  } catch (e) {
    await enqueueOfflineAttempt({ sessionId, studentId, attempt, moduleType });
  }
}

export async function endSession(sessionId: string): Promise<void> {
  try {
    const ref = doc(firestore, SESSIONS, sessionId);
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data) return;
    const total = (data.exercisesCompleted as number) || 0;
    const correct = (data.correctCount as number) || 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    await updateDoc(ref, { endedAt: serverTimestamp(), score });
  } catch {
    /* offline — sessionEnd handled by sync */
  }
}

async function bumpLearnerScore(studentId: string, type: ExerciseType, correct: boolean): Promise<void> {
  const studentRef = doc(firestore, STUDENTS, studentId);
  const delta = correct ? 2 : -1;
  const key = `learnerProfile.${scoreKey(type)}`;
  await updateDoc(studentRef, { [key]: increment(delta), updatedAt: serverTimestamp() });
}

function scoreKey(type: ExerciseType): string {
  switch (type) {
    case 'phonics':
      return 'phonicsScore';
    case 'vocabulary':
      return 'vocabularyScore';
    case 'pronunciation':
      return 'pronunciationScore';
    case 'reading':
      return 'readingLevel';
  }
}

export async function fetchRecentSessions(studentId: string, take = 20): Promise<LearningSession[]> {
  // Firestore would require a composite index for where + orderBy together.
  // We keep the query single-field and sort/slice on the client to skip index setup.
  const q = query(collection(firestore, SESSIONS), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  const all: LearningSession[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      studentId: data.studentId,
      date: data.date,
      startedAt: toMillis(data.startedAt),
      endedAt: data.endedAt ? toMillis(data.endedAt) : undefined,
      totalTimeMs: data.totalTimeMs ?? 0,
      exercisesCompleted: data.exercisesCompleted ?? 0,
      correctCount: data.correctCount ?? 0,
      score: data.score ?? 0,
      attempts: data.attempts ?? [],
    };
  });
  return all.sort((a, b) => b.startedAt - a.startedAt).slice(0, take);
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}
