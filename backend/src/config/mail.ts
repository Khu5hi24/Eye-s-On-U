import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpMail = process.env.SMTP_MAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

export const getTransport = async () => {
  if (!smtpHost || !smtpMail || !smtpPassword) {
    throw new Error('SMTP credentials are not fully configured in .env');
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
