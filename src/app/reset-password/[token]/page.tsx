'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = params as { token: string };
  const { resetPassword, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();
  const [backendError, setBackendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (error) {
      setBackendError(error);
      showToast(error, 'error');
      clearError();
    }
  }, [clearError, error, showToast]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const success = await resetPassword(token, data.password, data.confirmPassword);
    if (success) {
      showToast('Password has been reset successfully.', 'success');
      router.push('/login');
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Set a strong new password." 
      description="Choose a new password for your account and regain access safely." 
      tabActive="login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {backendError ? (
          <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
            {backendError}
          </div>
        ) : null}
        <PasswordField label="New Password" id="password" error={errors.password?.message} {...register('password')} />
        <PasswordField label="Confirm Password" id="confirmPassword" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
          {isSubmitting || loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
