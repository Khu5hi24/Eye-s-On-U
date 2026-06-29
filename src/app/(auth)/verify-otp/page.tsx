'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 60;

const createInputArray = () => Array.from({ length: OTP_LENGTH }, () => '');

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp, resendOtp, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();
  const [otpValues, setOtpValues] = useState<string[]>(createInputArray());
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('pendingEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setResendDisabled(false);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [clearError, error, showToast]);

  const otp = useMemo(() => otpValues.join(''), [otpValues]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const updated = [...otpValues];
    updated[index] = value.slice(-1);
    setOtpValues(updated);

    if (value.length > 1) {
      const digits = value.split('').slice(0, OTP_LENGTH);
      const merged = [...otpValues];
      digits.forEach((digit, idx) => {
        if (index + idx < OTP_LENGTH) merged[index + idx] = digit;
      });
      setOtpValues(merged);
      focusInput(Math.min(index + digits.length, OTP_LENGTH - 1));
      return;
    }

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      const updated = [...otpValues];
      updated[index - 1] = '';
      setOtpValues(updated);
      focusInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setMessage('Email is required to verify OTP.');
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setMessage('Please enter the 6-digit OTP.');
      return;
    }

    const success = await verifyOtp(email, otp);
    if (success) {
      showToast('Email verified successfully. You can now login.', 'success');
      sessionStorage.removeItem('pendingEmail');
      router.push('/login');
    } else {
      setMessage('OTP verification failed. Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage('Email is required to resend OTP.');
      return;
    }
    const success = await resendOtp(email);
    if (success) {
      setTimer(RESEND_INTERVAL);
      setResendDisabled(true);
      setMessage('OTP resent. Please check your inbox.');
      showToast('OTP resent. Please check your inbox.', 'success');
    } else {
      setMessage('Unable to resend OTP. Please try again later.');
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the OTP sent to your email address."
      description="Complete signup by verifying the code we just sent to you."
      tabActive="signup"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please enter the 6-digit code sent to <span className="font-medium text-foreground">{email || 'your email'}</span>.
          </p>
          <div className="flex items-center justify-center gap-2">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) {
                    inputsRef.current[index] = el;
                  }
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-12 rounded-2xl border border-border bg-background text-center text-xl font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>
        </div>

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="secondary" className="w-full" disabled={resendDisabled || loading} onClick={handleResend}>
            {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => router.push('/signup')}>
            Back to Signup
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
