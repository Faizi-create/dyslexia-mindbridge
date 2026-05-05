import { Router } from 'express';
import { z } from 'zod';
import { ExerciseModel } from '@/models/Exercise';
import { requireFirebaseAuth } from '@/middleware/firebaseAuth';

export const exercisesRouter = Router();

exercisesRouter.use(requireFirebaseAuth);

exercisesRouter.get('/', async (req, res) => {
  const q = z
    .object({
      type: z.enum(['phonics', 'reading', 'vocabulary', 'pronunciation']).optional(),
      language: z.enum(['en', 'ur']).default('en'),
      difficulty: z.coerce.number().optional(),
    })
    .parse(req.query);

  const filter: Record<string, unknown> = { language: q.language };
  if (q.type) filter.type = q.type;
  if (q.difficulty) filter.difficulty = q.difficulty;

  const list = await ExerciseModel.find(filter).limit(100);
  res.json(list);
});

exercisesRouter.get('/:id', async (req, res) => {
  const ex = await ExerciseModel.findById(req.params.id);
  if (!ex) {
    res.status(404).json({ error: 'Exercise not found' });
    return;
  }
  res.json(ex);
});
