import { Router } from 'express';
import { upload as uploadMiddleware } from '../middlewares/upload.middleware';
import { register, verifyOtp, login, forgotPassword, verifyForgotOtp, resetPassword, resendOtp, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/register', uploadMiddleware.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), register);
router.post('/signup', uploadMiddleware.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);

export default router;
