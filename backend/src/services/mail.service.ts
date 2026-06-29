import { getTransport } from '../config/mail';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendOTPEmail = async (email: string, otp: string, subject: string, message: string) => {
  const mailOptions = {
    from: process.env.SMTP_MAIL || 'no-reply@eyesonu.com',
    to: email,
    subject,
    html: `<p>${message}</p><p><strong>OTP:</strong> ${otp}</p>`,
    text: `${message}\nOTP: ${otp}`,
  };

  const transport = await getTransport();
  const info = await transport.sendMail(mailOptions);

  if (process.env.NODE_ENV !== 'production' && info.messageId) {
    console.info('OTP email sent successfully.', info.messageId);
  }

  return info;
};
