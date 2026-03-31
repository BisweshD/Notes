import { LoginForm } from '@/components/auth/login-form';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="w-full max-w-sm space-y-6 px-4">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">PsychScribe</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Psychiatric encounter documentation system
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
