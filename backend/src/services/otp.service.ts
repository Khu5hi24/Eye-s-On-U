import OTP from '../models/OTP.model';

export const saveOTP = async (email: string, otp: string) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ email, otp, expiresAt });
};

export const verifyOTP = async (email: string, otp: string) => {
  const record = await OTP.findOne({ email, otp });
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    return false;
  }

  await OTP.deleteOne({ _id: record._id });
  return true;
};
