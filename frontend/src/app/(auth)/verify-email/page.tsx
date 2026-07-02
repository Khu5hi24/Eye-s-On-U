'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { isValidEmail } from '@/utils/validateEmail';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const sent = searchParams.get('sent') === 'true';
  const { verifyEmail, resendVerification, loading, error, clearError } = useAuth();
  const { showToast } = useToastStore();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        return;
      }
      const success = await verifyEmail(token);
      setVerified(success);
    };

    verify();
  }, [token, verifyEmail]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [clearError, error, showToast]);

  const handleResend = async () => {
    setResendError(null);
    setResendSuccess(null);

    if (!resendEmail) {
      setResendError('Please enter the email address you used to sign up.');
      return;
    }

    if (!isValidEmail(resendEmail)) {
      setResendError('Please enter a valid email address.');
      return;
    }

    const success = await resendVerification(resendEmail.toLowerCase());
    if (success) {
      setResendSuccess('Verification email resent. Check your inbox.');
      showToast('Verification email resent. Check your inbox.', 'success');
    } else {
      setResendError('Unable to resend verification email. Please try again.');
    }
  };

  return (
    <AuthLayout 
      title="Verify Email" 
      subtitle="Confirm your identity." 
      description="Verify your email to finish setting up your account and sign in securely." 
      tabActive="login"
    >
      <div className="rounded-md border border-border bg-card p-6 text-center space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        ) : token ? (
          verified === true ? (
            <>
              <p className="text-base font-semibold text-foreground font-heading">Email verified successfully.</p>
              <p className="text-xs text-muted-foreground">You can now sign in with your account.</p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-destructive font-heading">Verification failed.</p>
              <p className="text-xs text-muted-foreground">The verification token is invalid or expired.</p>
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-secondary/30 p-4 text-left text-xs text-foreground">
                  <p className="font-semibold text-foreground">Resend verification email</p>
                  <p className="text-muted-foreground mt-0.5">Enter your email to receive a new verification link.</p>
                </div>
                {resendError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive text-left">
                    {resendError}
                  </div>
                ) : null}
                {resendSuccess ? (
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 text-left animate-fade-in">
                    {resendSuccess}
                  </div>
                ) : null}
                <div className="space-y-3">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(event) => setResendEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-border bg-input px-3.5 py-2 text-sm text-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                  <Button onClick={handleResend} className="w-full" disabled={loading}>
                    {loading ? 'Resending verification email...' : 'Resend verification email'}
                  </Button>
                </div>
                <Button onClick={() => router.push('/signup')} variant="secondary" className="w-full">
                  Create a new account
                </Button>
              </div>
            </>
          )
        ) : (
          <>
            <p className="text-base font-semibold text-foreground font-heading">Check your inbox</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a verification email to the address you signed up with. Open it and click the link to verify your account.
            </p>
            <div className="space-y-4">
              {resendError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive text-left">
                  {resendError}
                </div>
              ) : null}
              {resendSuccess ? (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 text-left animate-fade-in">
                  {resendSuccess}
                </div>
              ) : null}
              <div className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-input px-3.5 py-2 text-sm text-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <Button onClick={handleResend} className="w-full" disabled={loading}>
                  {loading ? 'Resending verification email...' : 'Resend verification email'}
                </Button>
              </div>
              <Button onClick={() => router.push('/login')} variant="secondary" className="w-full">
                Return to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
