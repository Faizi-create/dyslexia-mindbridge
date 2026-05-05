import { Router } from 'express';
import { z } from 'zod';
import { LearningSessionModel } from '@/models/LearningSession';
import { StudentModel } from '@/models/Student';
import { requireFirebaseAuth, AuthedRequest } from '@/middleware/firebaseAuth';

export const sessionsRouter = Router();

sessionsRouter.use(requireFirebaseAuth);

async function assertOwnsStudent(parentUid: string, studentId: string): Promise<boolean> {
  const s = await StudentModel.findOne({ _id: studentId, parentFirebaseUid: parentUid });
  return !!s;
}

sessionsRouter.post('/', async (req: AuthedRequest, res) => {
  const body = z.object({ studentId: z.string() }).parse(req.body);
  const ok = await assertOwnsStudent(req.firebaseUser!.uid, body.studentId);
  if (!ok) {
    res.status(403).json({ error: 'Not your student' });
    return;
  }
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const s = await LearningSessionModel.create({ studentId: body.studentId, date });
  res.status(201).json(s);
});

sessionsRouter.post('/:id/attempt', async (req: AuthedRequest, res) => {
  const body = z
    .object({
      exerciseId: z.string(),
      correct: z.boolean(),
      selectedOptionId: z.string().optional(),
      timeSpentMs: z.number().int().min(0),
    })
    .parse(req.body);

  const session = await LearningSessionModel.findById(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const ok = await assertOwnsStudent(req.firebaseUser!.uid, String(session.studentId));
  if (!ok) {
    res.status(403).json({ error: 'Not your student' });
    return;
  }
  session.attempts.push({ ...body, timestamp: new Date() });
  session.exercisesCompleted += 1;
  session.correctCount += body.correct ? 1 : 0;
  session.totalTimeMs += body.timeSpentMs;
  await session.save();
  res.json(session);
});

sessionsRouter.post('/:id/end', async (req: AuthedRequest, res) => {
  const session = await LearningSessionModel.findById(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const ok = await assertOwnsStudent(req.firebaseUser!.uid, String(session.studentId));
  if (!ok) {
    res.status(403).json({ error: 'Not your student' });
    return;
  }
  session.endedAt = new Date();
  session.score =
    session.exercisesCompleted > 0
      ? Math.round((session.correctCount / session.exercisesCompleted) * 100)
      : 0;
  await session.save();
  res.json(session);
});

sessionsRouter.get('/by-student/:studentId', async (req: AuthedRequest, res) => {
  const ok = await assertOwnsStudent(req.firebaseUser!.uid, String(req.params.studentId));
  if (!ok) {
    res.status(403).json({ error: 'Not your student' });
    return;
  }
  const list = await LearningSessionModel.find({ studentId: String(req.params.studentId) })
    .sort({ startedAt: -1 })
    .limit(50);
  res.json(list);
});
