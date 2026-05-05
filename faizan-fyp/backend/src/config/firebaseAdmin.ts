import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { env } from './env';

let initialized = false;

export function initFirebaseAdmin(): typeof admin {
  if (initialized) return admin;

  const saPath = path.resolve(process.cwd(), env.firebaseServiceAccountPath);
  if (!fs.existsSync(saPath)) {
    console.warn(
      `[firebaseAdmin] service account not found at ${saPath} — token verification will fail`,
    );
    return admin;
  }
  const sa = JSON.parse(fs.readFileSync(saPath, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id,
  });
  initialized = true;
  console.log('[firebaseAdmin] initialized for project', sa.project_id);
  return admin;
}

export { admin };
