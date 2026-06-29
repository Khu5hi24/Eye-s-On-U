'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const emailRegex = /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@(?!\d)[a-z][a-z0-9-]*(?:\.[a-z]{2,})+$/;

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Enter your email')
    .refine((value) => emailRegex.test(value.trim()), 'Enter a valid email with a valid domain and no numbers immediately after @')
    .transform((value) => value.trim()),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setBackendError(error);
      showToast(error, 'error');
      clearError();
    }
  }, [clearError, error, showToast]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setBackendError(null);
    const success = await forgotPassword(data.email.toLowerCase());
    if (success) {
      showToast('Password reset email sent. Check your inbox.', 'success');
      router.push('/login');
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="Don't panic, it happens to the best of us." 
      description="Enter your email and we will send you password reset instructions." 
      tabActive="login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {backendError ? (
          <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
            {backendError}
          </div>
        ) : null}
        <InputField label="Email" id="email" type="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
          {isSubmitting || loading ? 'Sending verification email...' : 'Send Reset Link'}
        </Button>
      </form>
    </AuthLayout>
  );
}
