import { Schema, model, Document } from 'mongoose';
import { IUser } from '../types';

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema<IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    specialization: { type: String, default: '' },
    role: { type: String, default: 'employee', enum: ['admin', 'employee', 'user'] },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IUserModel>('User', userSchema);
