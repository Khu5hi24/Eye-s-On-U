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
  email: z
    .string()
    .min(1, 'Enter your email')
    .refine((value) => isValidEmail(value), 'Enter a valid email address')
    .transform((value) => value.trim()),
});

const resetFormSchema = z
  .object({
    otp: z.string().length(6, 'Enter the 6-digit OTP'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must include uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
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
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
  });

  const [backendError, setBackendError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (error) {
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
        <form onSubmit={handleSubmitEmail(handleEmailSubmit)} className="space-y-5">
          {backendError ? (
            <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
              {backendError}
            </div>
          ) : null}
          <InputField label="Email" id="email" type="email" error={emailErrors.email?.message} {...registerEmail('email')} />
          <Button type="submit" className="w-full" disabled={isEmailSubmitting || loading}>
            {isEmailSubmitting || loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitReset(handleResetSubmit)} className="space-y-5">
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
          <PasswordField label="New Password" id="password" error={resetErrors.password?.message} {...registerReset('password')} />
          <PasswordField label="Confirm Password" id="confirmPassword" error={resetErrors.confirmPassword?.message} {...registerReset('confirmPassword')} />
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
