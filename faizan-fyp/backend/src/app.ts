import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { authRouter } from '@/routes/auth';
import { studentsRouter } from '@/routes/students';
import { exercisesRouter } from '@/routes/exercises';
import { sessionsRouter } from '@/routes/sessions';
import { aiRouter } from '@/routes/ai';
import { reportsRouter } from '@/routes/reports';
import { adminRouter } from '@/routes/admin';
import { errorHandler, notFound } from '@/middleware/errorHandler';

export function createApp(): express.Express {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({ windowMs: 60_000, max: 300 }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

  app.use('/api/auth', authRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/exercises', exercisesRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
