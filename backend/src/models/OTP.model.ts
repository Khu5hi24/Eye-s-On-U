import { Schema, model, Document } from 'mongoose';
import { IOTP } from '../types';

export interface IOTPModel extends IOTP, Document {}

const otpSchema = new Schema<IOTPModel>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IOTPModel>('OTP', otpSchema);
