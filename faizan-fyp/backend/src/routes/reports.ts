import { Router } from 'express';
import { z } from 'zod';
import { ProgressReportModel } from '@/models/ProgressReport';
import { StudentModel } from '@/models/Student';
import { LearningSessionModel } from '@/models/LearningSession';
import { generateInsights } from '@/services/adaptive';
import { requireFirebaseAuth, AuthedRequest } from '@/middleware/firebaseAuth';

export const reportsRouter = Router();
reportsRouter.use(requireFirebaseAuth);

reportsRouter.post('/generate', async (req: AuthedRequest, res) => {
  const body = z.object({ studentId: z.string() }).parse(req.body);
  const student = await StudentModel.findOne({
    _id: body.studentId,
    parentFirebaseUid: req.firebaseUser!.uid,
  });
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const sessions = await LearningSessionModel.find({ studentId: student._id })
    .sort({ startedAt: -1 })
    .limit(20);
  const attempts = sessions.flatMap((s) =>
    s.attempts.map((a) => ({
      exerciseId: a.exerciseId,
      correct: a.correct,
      timeSpentMs: a.timeSpentMs,
      timestamp: a.timestamp.getTime(),
    })),
  );

  const insights = await generateInsights({
    studentId: String(student._id),
    recentAttempts: attempts,
    learnerProfile: student.learnerProfile,
  });

  const report = await ProgressReportModel.create({
    studentId: student._id,
    masteryScore: insights.masteryScore,
    moduleScores: {
      phonics: student.learnerProfile.phonicsScore,
      reading: student.learnerProfile.readingLevel,
      vocabulary: student.learnerProfile.vocabularyScore,
      pronunciation: student.learnerProfile.pronunciationScore,
    },
    insights: [...insights.strengths, ...insights.challenges],
    recommendations: insights.recommendations,
  });

  res.json(report);
});

reportsRouter.get('/by-student/:studentId', async (req: AuthedRequest, res) => {
  const owns = await StudentModel.exists({
    _id: req.params.studentId,
    parentFirebaseUid: req.firebaseUser!.uid,
  });
  if (!owns) {
    res.status(403).json({ error: 'Not your student' });
    return;
  }
  const reports = await ProgressReportModel.find({ studentId: req.params.studentId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(reports);
});
