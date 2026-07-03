'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidEmail } from '@/utils/validateEmail';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField, PasswordField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const emailFormSchema = z.object({
  email: z.string()
    .min(1, 'Email is required.')
    .max(254, 'Email is too long.')
    .superRefine((v, ctx) => {
      if (!v || v.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email is required.',
        });
        return;
      }
      const trimmed = v.trim();
      if (/[A-Z]/.test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email cannot contain uppercase letters.',
        });
        return;
      }
      if ((trimmed.match(/@/g) || []).length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address.',
        });
        return;
      }
      if (!isValidEmail(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address.',
        });
      }
    }),
});

const resetFormSchema = z
  .object({
    otp: z.string().length(6, 'Please enter the 6-digit OTP.'),
    password: z
      .string()
      .min(8, 'Please enter a strong password.')
      .max(30, 'Password must be at most 30 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must include uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(8, 'Please confirm your password.').max(30, 'Confirm password must be at most 30 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type EmailFormValues = z.infer<typeof emailFormSchema>;
type ResetFormValues = z.infer<typeof resetFormSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyForgotOtp, resetPassword, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    mode: 'onChange',
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    mode: 'onChange',
  });

  const [backendError, setBackendError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');

  useEffect(() => {
    clearError();
    return () => {
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    if (error && error !== 'Invalid password' && error !== 'Incorrect password') {
      setBackendError(error);
      showToast(error, 'error');
      clearError();
    }
  }, [clearError, error, showToast]);

  const handleEmailSubmit = async (data: EmailFormValues) => {
    setBackendError(null);
    const normalizedEmail = data.email.toLowerCase();
    const success = await forgotPassword(normalizedEmail);
    if (success) {
      setEmail(normalizedEmail);
      setStep('reset');
      showToast('OTP sent to your email. Enter it below to reset your password.', 'success');
    }
  };

  const handleResetSubmit = async (data: ResetFormValues) => {
    setBackendError(null);

    const otpSuccess = await verifyForgotOtp(email, data.otp);
    if (!otpSuccess) {
      setBackendError('OTP verification failed. Please check your code and try again.');
      return;
    }

    const resetSuccess = await resetPassword(email, data.password, data.confirmPassword);
    if (resetSuccess) {
      showToast('Password reset successfully. You can now log in.', 'success');
      router.push('/login');
    }
  };

  return (
    <AuthLayout
      title={step === 'email' ? 'Forgot Password?' : 'Reset Password'}
      subtitle={step === 'email' ? "Don't panic, it happens to the best of us." : 'Enter the OTP and your new password.'}
      description={
        step === 'email'
          ? 'Enter your email and we will send you a password reset OTP.'
          : `We sent an OTP to ${email}. Use it to verify and reset your password.`
      }
      tabActive="login"
    >
      {step === 'email' ? (
        <form onSubmit={handleSubmitEmail(handleEmailSubmit)} className="space-y-5" noValidate>
          {backendError ? (
            <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
              {backendError}
            </div>
          ) : null}
          <InputField label="Email" id="email" type="email" error={emailErrors.email?.message} maxLength={254} {...registerEmail('email')} />
          <Button type="submit" className="w-full" disabled={isEmailSubmitting || loading}>
            {isEmailSubmitting || loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitReset(handleResetSubmit)} className="space-y-5" noValidate>
          {backendError ? (
            <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
              {backendError}
            </div>
          ) : null}
          <InputField
            label="OTP"
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            error={resetErrors.otp?.message}
            {...registerReset('otp')}
          />
          <PasswordField label="New Password" id="password" error={resetErrors.password?.message} maxLength={128} {...registerReset('password')} />
          <PasswordField label="Confirm Password" id="confirmPassword" error={resetErrors.confirmPassword?.message} maxLength={128} {...registerReset('confirmPassword')} />
          <Button type="submit" className="w-full" disabled={isResetSubmitting || loading}>
            {isResetSubmitting || loading ? 'Resetting password...' : 'Reset Password'}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => setStep('email')}>
            Use another email
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
