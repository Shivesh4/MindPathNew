// AI Assisted code, model name : Gemini 2.5 Pro Prompt : Create a consistent admin dashboard header component with navigation, search functionality, notifications, and user dropdown menu
'use client';

import Link from 'next/link';
import {
  Bell,
  Shield,
  Home,
  Users,
  FileText,
  LogOut,
  Search,
  Menu,
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
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import AdminBreadcrumb from './admin-breadcrumb';
import { useUser } from '@/hooks/use-user';

const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/sessions', label: 'Sessions', icon: FileText },
]

export default function AdminDashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get user's initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'AU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hidden items-center gap-2 sm:flex">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">MindPath Admin</span>
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
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              placeholder="Search..."
              type="search"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild>
            <Link href="/admin/notifications">
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
                      alt={user?.name || 'Admin User'} 
                    />
                  ) : (
                    <AvatarImage 
                      src="https://picsum.photos/seed/admin-avatar/32/32" 
                      alt={user?.name || 'Admin User'} 
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
                {user?.name || 'Admin User'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                 <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}