'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TeamMembersPanel } from '@/components/ui/dashboard/TeamMembersPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function TeamPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep everyone aligned on shared priorities.</p>
        </div>
      </div>
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Team members</CardTitle>
            <p className="text-sm text-muted-foreground">Your active people and working groups.</p>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <TeamMembersPanel />
        </CardContent>
      </Card>
    </div>
  );
}
