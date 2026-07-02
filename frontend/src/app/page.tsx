import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 text-center bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl rounded-xl border border-border dark:border-accent/30 bg-card p-8 sm:p-12 shadow-xs dark:shadow-[0_0_20px_rgba(197,168,128,0.08)] transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground font-heading">
          EYE&apos;S ON U
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Enterprise task management engineered for elite, role-based teams. Access workspaces, coordinate deliverables, and measure real-time performance.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/login" className="flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Sign In
          </Link>
          <Link href="/signup" className="flex items-center justify-center rounded-md border border-border bg-secondary/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
