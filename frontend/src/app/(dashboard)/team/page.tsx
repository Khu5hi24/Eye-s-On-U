'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TeamMembersPanel } from '@/components/ui/dashboard/TeamMembersPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';

export default function TeamPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const { teamMembers } = useTeamStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your people, assignments, and performance in one central place.</p>
        </div>
      </div>
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Team members</CardTitle>
            <p className="text-sm text-muted-foreground">All active members, roles, and workload details in one place.</p>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
            {teamMembers.length} Members
          </span>
        </CardHeader>
        <CardContent>
          <TeamMembersPanel />
        </CardContent>
      </Card>
    </div>
  );
}
