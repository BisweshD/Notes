import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userName = session.user.name || 'User';
  const userTitle = session.user.title;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={userName} userTitle={userTitle} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
