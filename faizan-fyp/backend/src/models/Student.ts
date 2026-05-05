import mongoose, { Schema } from 'mongoose';

export interface IStudent {
  parentFirebaseUid: string;
  name: string;
  age: number;
  grade?: string;
  avatarIndex: number;
  currentLevel: number;
  dailyTimeLimitMinutes: number;
  learnerProfile: {
    readingLevel: number;
    phonicsScore: number;
    vocabularyScore: number;
    pronunciationScore: number;
    strengths: string[];
    challenges: string[];
    preferredLanguage: 'en' | 'ur';
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    audioHints: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    parentFirebaseUid: { type: String, required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 4, max: 14 },
    grade: String,
    avatarIndex: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    dailyTimeLimitMinutes: { type: Number, default: 30 },
    learnerProfile: {
      readingLevel: { type: Number, default: 1 },
      phonicsScore: { type: Number, default: 0 },
      vocabularyScore: { type: Number, default: 0 },
      pronunciationScore: { type: Number, default: 0 },
      strengths: { type: [String], default: [] },
      challenges: { type: [String], default: [] },
      preferredLanguage: { type: String, enum: ['en', 'ur'], default: 'en' },
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      audioHints: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const StudentModel = mongoose.model<IStudent>('Student', studentSchema);
