import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import User from '../models/User.model';
import OTP from '../models/OTP.model';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateOTP } from '../utils/generateOTP';
import { uploadAvatar } from '../services/cloudinary.service';
import { sendOTPEmail } from '../services/mail.service';
import { saveOTP, verifyOTP } from '../services/otp.service';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

dotenv.config();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = (email || '').toString().toLowerCase().trim();
    const file = (req as any).file || (req as any).files?.profilePicture?.[0] || (req as any).files?.avatar?.[0];

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await hashPassword(password);
    let avatar = '';

    if (file?.buffer) {
      const uploadedAvatar = await uploadAvatar(file);
      if (uploadedAvatar) {
        avatar = uploadedAvatar;
      }
    }

    const allowedRoles = ['admin', 'employee', 'user'] as const;
    const normalizedRole: 'admin' | 'employee' | 'user' =
      typeof role === 'string' && (allowedRoles as readonly string[]).includes(role) ? (role as 'admin' | 'employee' | 'user') : 'employee';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      avatar,
      role: normalizedRole,
      isVerified: false,
    } as any);

    const otp = generateOTP();
    await saveOTP(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, otp, 'Verify Your Account', 'Use the OTP to verify your account');

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'User registered successfully. OTP sent to email.',
      data: { userId: user._id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const valid = await verifyOTP(email, otp);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'Account verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toString().toLowerCase().trim();

    console.log('[auth.controller] login request body', req.body);

    const user = await User.findOne({ email: normalizedEmail });
    console.log('[auth.controller] user lookup result', user ? { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified } : null);

    if (!user) {
      const responsePayload = { success: false, message: 'User not found' };
      console.log('[auth.controller] login response', responsePayload);
      return res.status(401).json(responsePayload);
    }

    const passwordMatches = await comparePassword(password, user.password);
    console.log('[auth.controller] password compare result', passwordMatches);

    if (!passwordMatches) {
      const responsePayload = { success: false, message: 'Invalid password' };
      console.log('[auth.controller] login response', responsePayload);
      return res.status(401).json(responsePayload);
    }

    console.log('[auth.controller] isVerified status', user.isVerified);
    if (!user.isVerified) {
      const responsePayload = { success: false, message: 'Account not verified' };
      console.log('[auth.controller] login response', responsePayload);
      return res.status(403).json(responsePayload);
    }

    // Role is determined from the user document in the database; no role required from request

    const accessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    const responsePayload = { success: true, data: { accessToken, refreshToken } };

    console.log('[auth.controller] login response', responsePayload);
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[auth.controller] login error', error);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp, 'Reset Your Password', 'Use the OTP to reset your password');

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const valid = await verifyOTP(email, otp);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = await hashPassword(password);
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp, 'Resend OTP', 'Your new OTP code');

    res.status(200).json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};
