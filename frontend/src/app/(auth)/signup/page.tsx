'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isValidEmail } from '@/utils/validateEmail';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { InputField, PasswordField, SelectField, FileInputField } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const emailRegex = /^[A-Za-z0-9]+(?:[._%+-][A-Za-z0-9]+)*@(?!\d)[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z]{2,})+$/;

const signupSchema = z
  .object({
    name: z.string().min(2, 'Please enter name atleast 2 characters.').max(100, 'Name must be at most 100 characters'),
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
    password: z.string().min(8, 'Please enter your password.').max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string().min(8, 'Please enter your confirmed password.').max(128, 'Password must be at most 128 characters'),
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
    mode: 'onChange',
    defaultValues: {},
  });


  const onSubmit = async (data: SignupFormValues) => {
    const fileList = data.profilePicture as FileList | undefined;
    const file = fileList?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      showToast('Profile picture size must be less than 2MB.', 'error');
      return;
    }

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
    <AuthLayout title="Create your account" tabActive="signup">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        <InputField label="Full name" id="name" autoComplete="name" placeholder="Please enter your full name" error={errors.name} maxLength={100} {...register('name')} />
        <InputField label="Email address" id="email" type="email" autoComplete="email" placeholder="Please enter your email address" error={errors.email} maxLength={254} {...register('email')} />
        <PasswordField label="Password" id="password" autoComplete="new-password" placeholder="Please choose a strong password" error={errors.password} maxLength={128} {...register('password')} />
        <PasswordField label="Confirm password" id="confirmPassword" autoComplete="new-password" placeholder="Please confirm your chosen password" error={errors.confirmPassword} maxLength={128} {...register('confirmPassword')} />

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
