'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  userName: string;
  userTitle?: string;
}

export function Sidebar({ userName, userTitle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-base tracking-tight">PsychScribe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            {userTitle && (
              <p className="text-xs text-muted-foreground truncate">{userTitle}</p>
            )}
          </div>
        </div>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
