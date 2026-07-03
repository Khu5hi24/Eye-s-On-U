import OTP from '../models/OTP.model';

export const saveOTP = async (email: string, otp: string, tempUserData?: any) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.deleteMany({ email });
  await OTP.create({ email, otp, expiresAt, tempUserData });
};

export const verifyOTP = async (email: string, otp: string) => {
  const record = await OTP.findOne({ email, otp });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    return null;
  }

  await OTP.deleteOne({ _id: record._id });
  return record;
};
