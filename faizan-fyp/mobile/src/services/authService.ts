import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firestore } from '@/config/firebase';
import { ChildProfile, UserProfile, UserRole } from '@/types';

const USERS = 'users';
const STUDENTS = 'students';

export async function registerParent(params: {
  email: string;
  password: string;
  name: string;
}): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, params.email, params.password);
  await updateProfile(cred.user, { displayName: params.name });

  const profile: UserProfile = {
    uid: cred.user.uid,
    email: params.email,
    name: params.name,
    role: 'parent',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await setDoc(doc(firestore, USERS, cred.user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return profile;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return cred.user;
}

export async function logout(): Promise<void> {
  await signOut(firebaseAuth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, USERS, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    name: data.name,
    role: data.role as UserRole,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function listChildrenForParent(parentId: string): Promise<ChildProfile[]> {
  const q = query(collection(firestore, STUDENTS), where('parentId', '==', parentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      parentId: data.parentId,
      name: data.name,
      age: data.age,
      grade: data.grade,
      avatarIndex: data.avatarIndex ?? 0,
      learnerProfile: data.learnerProfile ?? defaultLearnerProfile(),
      currentLevel: data.currentLevel ?? 1,
      dailyTimeLimitMinutes: data.dailyTimeLimitMinutes ?? 30,
      accessibility: data.accessibility ?? { highContrast: false, largeText: false, audioHints: true },
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  });
}

export async function createChildProfile(params: {
  parentId: string;
  name: string;
  age: number;
  grade?: string;
  avatarIndex: number;
}): Promise<ChildProfile> {
  const payload = {
    parentId: params.parentId,
    name: params.name,
    age: params.age,
    grade: params.grade ?? '',
    avatarIndex: params.avatarIndex,
    learnerProfile: defaultLearnerProfile(),
    currentLevel: 1,
    dailyTimeLimitMinutes: 30,
    accessibility: { highContrast: false, largeText: false, audioHints: true },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(firestore, STUDENTS), payload);
  return {
    id: ref.id,
    ...payload,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as ChildProfile;
}

function defaultLearnerProfile() {
  return {
    readingLevel: 1,
    phonicsScore: 0,
    vocabularyScore: 0,
    pronunciationScore: 0,
    strengths: [],
    challenges: [],
    preferredLanguage: 'en' as const,
  };
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}
