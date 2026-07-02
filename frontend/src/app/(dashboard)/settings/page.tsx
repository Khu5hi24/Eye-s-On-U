'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Customize your workspace preferences.</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <SettingsIcon className="h-4 w-4" />
        </div>
      </div>
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Workspace preferences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Your preferences and workspace settings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
