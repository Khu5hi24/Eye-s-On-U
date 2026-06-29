'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';

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
      <div className="rounded-3xl border border-border/70 bg-background/90 p-8 text-center space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        ) : token ? (
          verified === true ? (
            <>
              <p className="text-lg font-semibold text-foreground">Email verified successfully.</p>
              <p className="text-sm text-muted-foreground">You can now sign in with your account.</p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-destructive">Verification failed.</p>
              <p className="text-sm text-muted-foreground">The verification token is invalid or expired.</p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-secondary/10 p-4 text-left text-sm text-foreground">
                  <p className="font-semibold">Resend verification email</p>
                  <p className="text-muted-foreground">Enter your email to receive a new verification link.</p>
                </div>
                {resendError ? (
                  <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
                    {resendError}
                  </div>
                ) : null}
                {resendSuccess ? (
                  <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-800">
                    {resendSuccess}
                  </div>
                ) : null}
                <div className="space-y-3">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(event) => setResendEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            <p className="text-lg font-semibold text-foreground">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              We sent a verification email to the address you signed up with. Open it and click the link to verify your account.
            </p>
            <div className="space-y-4">
              {resendError ? (
                <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-800">
                  {resendError}
                </div>
              ) : null}
              {resendSuccess ? (
                <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-800">
                  {resendSuccess}
                </div>
              ) : null}
              <div className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30"
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
