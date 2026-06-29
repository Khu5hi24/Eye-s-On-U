import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const accessSecret = process.env.JWT_SECRET || 'default_jwt_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret';

export const generateAccessToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, accessSecret, { expiresIn: '15m' });

export const generateRefreshToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, refreshSecret, { expiresIn: '30d' });

export const verifyAccessToken = (token: string) => jwt.verify(token, accessSecret);
export const verifyRefreshToken = (token: string) => jwt.verify(token, refreshSecret);
