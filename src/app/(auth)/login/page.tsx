'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField, PasswordField, SelectField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const loginSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log('[login page] submit payload', { email: data.email, password: data.password });

    const success = await login({ email: data.email.toLowerCase(), password: data.password });

    console.log('[login page] login result', success);

    if (success) {
      showToast('Signed in successfully.', 'success');
      router.push('/dashboard');
      console.log('[login page] redirect confirmed to /dashboard');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue." description="Access your workspace and daily tasks securely." tabActive="login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email address" id="email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
        <PasswordField label="Password" id="password" autoComplete="current-password" error={errors.password} {...register('password')} />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Role selection removed from signin; role will be detected from the server */}

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
