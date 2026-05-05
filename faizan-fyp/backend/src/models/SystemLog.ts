import mongoose, { Schema } from 'mongoose';

export interface ISystemLog {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const schema = new Schema<ISystemLog>(
  {
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info', index: true },
    message: { type: String, required: true },
    context: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const SystemLogModel = mongoose.model<ISystemLog>('SystemLog', schema);
