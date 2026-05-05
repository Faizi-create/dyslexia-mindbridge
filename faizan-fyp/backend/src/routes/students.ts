import { Router } from 'express';
import { z } from 'zod';
import { StudentModel } from '@/models/Student';
import { requireFirebaseAuth, AuthedRequest } from '@/middleware/firebaseAuth';

export const studentsRouter = Router();

studentsRouter.use(requireFirebaseAuth);

studentsRouter.get('/', async (req: AuthedRequest, res) => {
  const kids = await StudentModel.find({ parentFirebaseUid: req.firebaseUser!.uid });
  res.json(kids);
});

studentsRouter.post('/', async (req: AuthedRequest, res) => {
  const body = z
    .object({
      name: z.string().min(1),
      age: z.number().int().min(4).max(14),
      grade: z.string().optional(),
      avatarIndex: z.number().int().min(0).max(10).default(0),
    })
    .parse(req.body);

  const kid = await StudentModel.create({
    parentFirebaseUid: req.firebaseUser!.uid,
    ...body,
  });
  res.status(201).json(kid);
});

studentsRouter.patch('/:id', async (req: AuthedRequest, res) => {
  const patch = z
    .object({
      name: z.string().optional(),
      age: z.number().int().min(4).max(14).optional(),
      grade: z.string().optional(),
      avatarIndex: z.number().int().optional(),
      currentLevel: z.number().int().optional(),
      dailyTimeLimitMinutes: z.number().int().min(5).max(240).optional(),
      accessibility: z
        .object({
          highContrast: z.boolean(),
          largeText: z.boolean(),
          audioHints: z.boolean(),
        })
        .optional(),
    })
    .parse(req.body);

  const kid = await StudentModel.findOneAndUpdate(
    { _id: req.params.id, parentFirebaseUid: req.firebaseUser!.uid },
    patch,
    { new: true },
  );
  if (!kid) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  res.json(kid);
});

studentsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const result = await StudentModel.deleteOne({
    _id: req.params.id,
    parentFirebaseUid: req.firebaseUser!.uid,
  });
  res.json({ deleted: result.deletedCount });
});
