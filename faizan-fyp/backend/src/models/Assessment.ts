import mongoose, { Schema } from 'mongoose';

export interface IAssessment {
  studentId: mongoose.Types.ObjectId;
  results: {
    module: string;
    correct: boolean;
    exerciseId: string;
  }[];
  aiReview?: string;
  recommendedLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAssessment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    results: [
      {
        _id: false,
        module: String,
        correct: Boolean,
        exerciseId: String,
      },
    ],
    aiReview: String,
    recommendedLevel: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const AssessmentModel = mongoose.model<IAssessment>('Assessment', schema);
