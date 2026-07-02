'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isValidEmail } from '@/utils/validateEmail';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField, PasswordField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').max(254, 'Email must be at most 254 characters').refine((v) => isValidEmail(v), 'Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError, user } = useAuth();
  const { showToast } = useToastStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Clear previous errors when the login page is loaded and when it unmounts
  useEffect(() => {
    clearError();
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    console.log('[login page] submit payload', { email: data.email, password: data.password });

    const success = await login({ email: data.email.toLowerCase(), password: data.password });

    console.log('[login page] login result', success);

    if (success) {
      setIsSuccess(true);
      // Wait for 2 seconds for user to see the personalized welcome card before routing
      setTimeout(() => {
        router.push('/dashboard');
        console.log('[login page] redirect confirmed to /dashboard');
      }, 2000);
    }
  };

  // Convert "Invalid password" string returned from backend to "Incorrect password"
  const displayError = error === 'Invalid password' ? 'Incorrect password' : error;

  // Render Welcome Card instead of form on successful login
  if (isSuccess) {
    return (
      <AuthLayout title="" tabActive="login">
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 animate-fade-in">
          {/* Animated Success Ring */}
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shadow-sm shadow-emerald-500/5">
            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground font-heading">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-xs text-muted-foreground">
              Preparing your workspace...
            </p>
          </div>
          
          {/* Bounce loader */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back!" tabActive="login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <InputField label="Email address" id="email" type="email" autoComplete="email" placeholder="Please enter your email address" error={errors.email} maxLength={254} {...register('email')} />
        <PasswordField label="Password" id="password" autoComplete="current-password" placeholder="Please enter your secure password" error={errors.password} maxLength={128} {...register('password')} />

        {/* Row with aligned error on the left and forgot password link on the right */}
        <div className="flex items-center justify-between min-h-[1.5rem] py-0.5">
          <div>
            {displayError ? (
              <p className="text-xs font-semibold text-destructive leading-none">
                {displayError}
              </p>
            ) : null}
          </div>
          <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:underline leading-none">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
