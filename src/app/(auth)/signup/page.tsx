'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField, PasswordField, SelectField, FileInputField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['employee', 'admin']),
    // adminSecretCode removed per request
    profilePicture: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();
  const [selectedRole, setSelectedRole] = useState<'employee' | 'admin'>('employee');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {},
  });


  const onSubmit = async (data: SignupFormValues) => {
    const success = await signup({
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      password: data.password,
      confirmPassword: data.confirmPassword,
      profilePicture: data.profilePicture,
    } as any);

    if (success) {
      showToast('Account created. Please verify your email.', 'success');
      sessionStorage.setItem('pendingEmail', data.email.toLowerCase());
      router.push('/verify-otp');
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Sign up to get started." description="Use your work email to create an account." tabActive="signup">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Full name" id="name" autoComplete="name" error={errors.name} {...register('name')} />
        <InputField label="Email address" id="email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
        <PasswordField label="Password" id="password" autoComplete="new-password" error={errors.password} {...register('password')} />
        <PasswordField label="Confirm password" id="confirmPassword" autoComplete="new-password" error={errors.confirmPassword} {...register('confirmPassword')} />

        <SelectField label="Select role" id="role" error={errors.role} {...register('role', { onChange: (e) => setSelectedRole(e.target.value as 'employee' | 'admin') })}>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </SelectField>

        {/* Admin secret removed: admins can register without a secret code */}

        <FileInputField label="Profile picture (optional)" id="profilePicture" error={errors.profilePicture} {...register('profilePicture')} />

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
