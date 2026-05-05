import { NextFunction, Request, Response } from 'express';
import { admin } from '@/config/firebaseAdmin';

export interface AuthedRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

export async function requireFirebaseAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
