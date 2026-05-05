import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  doc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { ExerciseAttempt, ExerciseType } from '@/types';

const QUEUE_KEY = 'dmb.offlineQueue.v1';

interface QueuedAttempt {
  sessionId: string;
  studentId: string;
  attempt: ExerciseAttempt;
  moduleType: ExerciseType;
}

export async function enqueueOfflineAttempt(item: QueuedAttempt): Promise<void> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const list: QueuedAttempt[] = raw ? JSON.parse(raw) : [];
  list.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
}

export async function flushOfflineQueue(): Promise<number> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return 0;
  const list: QueuedAttempt[] = JSON.parse(raw);
  if (list.length === 0) return 0;

  const remaining: QueuedAttempt[] = [];
  for (const item of list) {
    try {
      const ref = doc(firestore, 'learningSessions', item.sessionId);
      const snap = await getDoc(ref);
      const existing = (snap.data()?.attempts ?? []) as ExerciseAttempt[];
      await updateDoc(ref, {
        attempts: [...existing, item.attempt],
        exercisesCompleted: increment(1),
        correctCount: increment(item.attempt.correct ? 1 : 0),
        totalTimeMs: increment(item.attempt.timeSpentMs),
      });
      const studentRef = doc(firestore, 'students', item.studentId);
      const delta = item.attempt.correct ? 2 : -1;
      const key = `learnerProfile.${scoreKey(item.moduleType)}`;
      await updateDoc(studentRef, { [key]: increment(delta), updatedAt: serverTimestamp() });
    } catch {
      remaining.push(item);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return list.length - remaining.length;
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

export function startOfflineSync(): () => void {
  const unsub = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      flushOfflineQueue().catch(() => {});
    }
  });
  return unsub;
}
