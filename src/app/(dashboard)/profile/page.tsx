'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep your profile details up to date.</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <UserRound className="h-4 w-4" />
        </div>
      </div>
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Name:</span> {user.name}</p>
          <p><span className="font-semibold text-foreground">Email:</span> {user.email}</p>
          <p><span className="font-semibold text-foreground">Role:</span> {user.role}</p>
        </CardContent>
      </Card>
    </div>
  );
}
