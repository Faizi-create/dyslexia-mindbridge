import { Router } from 'express';
import { z } from 'zod';
import { pickNextActivity, generateInsights } from '@/services/adaptive';
import { requireFirebaseAuth } from '@/middleware/firebaseAuth';
import rateLimit from 'express-rate-limit';

export const aiRouter = Router();

aiRouter.use(requireFirebaseAuth);
aiRouter.use(rateLimit({ windowMs: 60_000, max: 60 }));

const attemptSchema = z.object({
  exerciseId: z.string(),
  correct: z.boolean(),
  timeSpentMs: z.number().int().min(0).default(0),
  timestamp: z.number().int().default(() => Date.now()),
});

const learnerSchema = z.object({
  readingLevel: z.number().default(1),
  phonicsScore: z.number().default(0),
  vocabularyScore: z.number().default(0),
  pronunciationScore: z.number().default(0),
  strengths: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  preferredLanguage: z.enum(['en', 'ur']).default('en'),
});

aiRouter.post('/next-activity', async (req, res) => {
  const body = z
    .object({
      studentId: z.string(),
      currentModule: z.enum(['phonics', 'reading', 'vocabulary', 'pronunciation']),
      language: z.enum(['en', 'ur']).default('en'),
      recentAttempts: z.array(attemptSchema).default([]),
      learnerProfile: learnerSchema,
      currentLevel: z.number().int().min(1).max(5).default(1),
      excludeIds: z.array(z.string()).optional(),
    })
    .parse(req.body);

  const result = await pickNextActivity(body);
  res.json(result);
});

aiRouter.post('/insights', async (req, res) => {
  const body = z
    .object({
      studentId: z.string(),
      recentAttempts: z.array(attemptSchema).default([]),
      learnerProfile: learnerSchema,
    })
    .parse(req.body);

  const result = await generateInsights(body);
  res.json(result);
});
