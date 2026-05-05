import mongoose, { Schema } from 'mongoose';

export interface IAttempt {
  exerciseId: string;
  correct: boolean;
  selectedOptionId?: string;
  timeSpentMs: number;
  timestamp: Date;
}

export interface ILearningSession {
  studentId: mongoose.Types.ObjectId;
  date: string;
  startedAt: Date;
  endedAt?: Date;
  totalTimeMs: number;
  exercisesCompleted: number;
  correctCount: number;
  score: number;
  attempts: IAttempt[];
}

const attemptSchema = new Schema<IAttempt>(
  {
    exerciseId: { type: String, required: true },
    correct: { type: Boolean, required: true },
    selectedOptionId: String,
    timeSpentMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const sessionSchema = new Schema<ILearningSession>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    date: { type: String, required: true, index: true },
    startedAt: { type: Date, default: () => new Date() },
    endedAt: Date,
    totalTimeMs: { type: Number, default: 0 },
    exercisesCompleted: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    attempts: { type: [attemptSchema], default: [] },
  },
  { timestamps: true },
);

export const LearningSessionModel = mongoose.model<ILearningSession>(
  'LearningSession',
  sessionSchema,
);
