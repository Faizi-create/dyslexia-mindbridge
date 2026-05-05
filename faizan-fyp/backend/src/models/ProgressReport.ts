import mongoose, { Schema } from 'mongoose';

export interface IProgressReport {
  studentId: mongoose.Types.ObjectId;
  generatedAt: Date;
  masteryScore: number;
  moduleScores: Record<string, number>;
  insights: string[];
  recommendations: string[];
}

const schema = new Schema<IProgressReport>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    generatedAt: { type: Date, default: () => new Date() },
    masteryScore: Number,
    moduleScores: { type: Schema.Types.Mixed, default: {} },
    insights: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ProgressReportModel = mongoose.model<IProgressReport>('ProgressReport', schema);
