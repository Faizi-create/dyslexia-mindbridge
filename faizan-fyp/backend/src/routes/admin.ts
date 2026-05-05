import { Router } from 'express';
import { z } from 'zod';
import { UserModel } from '@/models/User';
import { StudentModel } from '@/models/Student';
import { ExerciseModel } from '@/models/Exercise';
import { LearningSessionModel } from '@/models/LearningSession';
import { SystemLogModel } from '@/models/SystemLog';
import { requireAdmin } from '@/middleware/adminAuth';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/users', async (_req, res) => {
  const users = await UserModel.find().sort({ createdAt: -1 }).limit(200);
  res.json(users);
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const body = z.object({ role: z.enum(['parent', 'child', 'admin']) }).parse(req.body);
  const user = await UserModel.findByIdAndUpdate(req.params.id, { role: body.role }, { new: true });
  res.json(user);
});

adminRouter.delete('/users/:id', async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

adminRouter.get('/students', async (_req, res) => {
  const list = await StudentModel.find().sort({ createdAt: -1 }).limit(200);
  res.json(list);
});

adminRouter.get('/exercises', async (req, res) => {
  const q = z.object({ type: z.string().optional(), language: z.string().optional() }).parse(req.query);
  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.language) filter.language = q.language;
  const list = await ExerciseModel.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json(list);
});

const exerciseBody = z.object({
  type: z.enum(['phonics', 'reading', 'vocabulary', 'pronunciation']),
  language: z.enum(['en', 'ur']),
  difficulty: z.number().int().min(1).max(5),
  prompt: z.string(),
  instruction: z.string().optional(),
  options: z
    .array(z.object({ id: z.string(), label: z.string(), hint: z.string().optional() }))
    .optional(),
  correctOptionId: z.string().optional(),
  targetWord: z.string().optional(),
  targetSentence: z.string().optional(),
  explanation: z.string().optional(),
});

adminRouter.post('/exercises', async (req, res) => {
  const body = exerciseBody.parse(req.body);
  const ex = await ExerciseModel.create(body);
  res.status(201).json(ex);
});

adminRouter.patch('/exercises/:id', async (req, res) => {
  const body = exerciseBody.partial().parse(req.body);
  const ex = await ExerciseModel.findByIdAndUpdate(req.params.id, body, { new: true });
  res.json(ex);
});

adminRouter.delete('/exercises/:id', async (req, res) => {
  await ExerciseModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

adminRouter.get('/analytics', async (_req, res) => {
  const [userCount, studentCount, exerciseCount, sessionCount] = await Promise.all([
    UserModel.countDocuments(),
    StudentModel.countDocuments(),
    ExerciseModel.countDocuments(),
    LearningSessionModel.countDocuments(),
  ]);

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = await LearningSessionModel.countDocuments({
    startedAt: { $gte: since },
  });

  res.json({
    users: userCount,
    students: studentCount,
    exercises: exerciseCount,
    totalSessions: sessionCount,
    sessionsThisWeek,
  });
});

adminRouter.get('/logs', async (req, res) => {
  const q = z.object({ level: z.enum(['info', 'warn', 'error']).optional() }).parse(req.query);
  const filter = q.level ? { level: q.level } : {};
  const list = await SystemLogModel.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(list);
});
