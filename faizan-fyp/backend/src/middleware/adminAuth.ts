import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface AdminRequest extends Request {
  admin?: { email: string };
}

export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Admin token required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { role?: string; email?: string };
    if (decoded.role !== 'admin' || !decoded.email) {
      res.status(403).json({ error: 'Not an admin token' });
      return;
    }
    req.admin = { email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid admin token' });
  }
}
