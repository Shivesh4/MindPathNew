'use client';

import Link from 'next/link';
import {
  Bell,
  GraduationCap,
  Home,
  LineChart,
  Users2,
  CalendarCheck,
  Inbox,
  User,
  Settings,
  LogOut,
  BellRing,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import BottomNavbar from './bottom-navbar';
import { useUser } from '@/hooks/use-user';
import * as React from 'react';

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/tutors', label: 'Tutors', icon: Users2 },
    { href: '/dashboard/sessions', label: 'Sessions', icon: CalendarCheck },
    { href: '/dashboard/progress', label: 'Progress', icon: LineChart },
    { href: '/dashboard/messages', label: 'Messages', icon: Inbox },
]

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get user's initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">MindPath</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-base font-medium md:flex">
          {navLinks.map(({href, label}) => (
               <Link
               key={href}
               href={href}
               className={cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  pathname === href && 'bg-primary/10 text-primary px-3 py-1.5 rounded-md'
               )}
             >
               {label}
             </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full relative" asChild>
            <Link href="/dashboard/notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  {user?.avatarId ? (
                    <AvatarImage 
                      src={`/uploads/${user.avatarId}`} 
                      alt={user?.name || 'User'} 
                    />
                  ) : (
                    <AvatarImage 
                      src="https://picsum.photos/seed/user-avatar/32/32" 
                      alt={user?.name || 'User'} 
                      data-ai-hint="person portrait"
                    />
                  )}
                  <AvatarFallback>
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || 'User'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                 <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <BottomNavbar navLinks={navLinks} />
    </>
  );
}