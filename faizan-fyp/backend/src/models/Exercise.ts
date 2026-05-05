import mongoose, { Schema } from 'mongoose';

export interface IExerciseOption {
  id: string;
  label: string;
  hint?: string;
}

export interface IExercise {
  type: 'phonics' | 'reading' | 'vocabulary' | 'pronunciation';
  language: 'en' | 'ur';
  difficulty: number;
  prompt: string;
  instruction?: string;
  options?: IExerciseOption[];
  correctOptionId?: string;
  targetWord?: string;
  targetSentence?: string;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IExerciseOption>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    hint: String,
  },
  { _id: false },
);

const exerciseSchema = new Schema<IExercise>(
  {
    type: {
      type: String,
      enum: ['phonics', 'reading', 'vocabulary', 'pronunciation'],
      required: true,
      index: true,
    },
    language: { type: String, enum: ['en', 'ur'], required: true, index: true },
    difficulty: { type: Number, min: 1, max: 5, required: true, index: true },
    prompt: { type: String, required: true },
    instruction: String,
    options: [optionSchema],
    correctOptionId: String,
    targetWord: String,
    targetSentence: String,
    explanation: String,
  },
  { timestamps: true },
);

export const ExerciseModel = mongoose.model<IExercise>('Exercise', exerciseSchema);
