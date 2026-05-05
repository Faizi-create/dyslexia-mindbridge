import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { UserModel } from '@/models/User';
import { requireFirebaseAuth, AuthedRequest } from '@/middleware/firebaseAuth';

export const authRouter = Router();

/** Called from mobile after firebase sign-up/sign-in to sync the user into MongoDB. */
authRouter.post('/sync', requireFirebaseAuth, async (req: AuthedRequest, res) => {
  const body = z
    .object({ name: z.string().min(1), role: z.enum(['parent', 'child']).default('parent') })
    .parse(req.body);

  const user = await UserModel.findOneAndUpdate(
    { firebaseUid: req.firebaseUser!.uid },
    {
      firebaseUid: req.firebaseUser!.uid,
      email: req.firebaseUser!.email ?? '',
      name: body.name,
      role: body.role,
    },
    { upsert: true, new: true },
  );
  res.json(user);
});

authRouter.get('/me', requireFirebaseAuth, async (req: AuthedRequest, res) => {
  const user = await UserModel.findOne({ firebaseUid: req.firebaseUser!.uid });
  res.json(user);
});

/** Admin-only login using env-provided credentials. Returns a JWT. */
authRouter.post('/admin/login', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
  if (body.email.toLowerCase() !== env.adminEmail.toLowerCase() || body.password !== env.adminPassword) {
    res.status(401).json({ error: 'Invalid admin credentials' });
    return;
  }
  const token = jwt.sign({ role: 'admin', email: body.email }, env.jwtSecret, { expiresIn: '12h' });
  res.json({ token, expiresIn: 12 * 60 * 60 });
});
