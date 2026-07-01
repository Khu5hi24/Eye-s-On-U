import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpMail = process.env.SMTP_MAIL?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.trim();

export const getTransport = async () => {
  const missing = [];
  if (!smtpHost) missing.push('SMTP_HOST');
  if (!smtpMail) missing.push('SMTP_MAIL');
  if (!smtpPassword) missing.push('SMTP_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`SMTP credentials are not fully configured in .env. Missing: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpMail,
      pass: smtpPassword,
    },
  });
};
