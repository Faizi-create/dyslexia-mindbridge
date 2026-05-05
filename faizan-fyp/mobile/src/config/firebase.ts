import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// getReactNativePersistence exists at runtime but is not in the firebase v11 type defs
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: unknown) => unknown;
};
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from './env';

const app = getApps().length === 0 ? initializeApp(env.firebase) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) as any,
  });
} catch {
  auth = getAuth(app);
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
