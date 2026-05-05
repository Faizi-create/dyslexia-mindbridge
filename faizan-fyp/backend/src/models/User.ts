import mongoose, { Schema } from 'mongoose';

export interface IUser {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'parent' | 'child' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['parent', 'child', 'admin'], default: 'parent' },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
