import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="w-full max-w-2xl rounded-[28px] border border-border/60 bg-background/90 p-10 shadow-2xl glass">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Eye&apos;s on U</h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Modern task management built for role-based teams. Sign in as admin or employee, track tasks, and stay productive.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/login" className="rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Login
          </Link>
          <Link href="/signup" className="rounded-2xl border border-border bg-secondary/80 px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
