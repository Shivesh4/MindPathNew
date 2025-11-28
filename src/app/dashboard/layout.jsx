import DashboardHeader from '@/components/dashboard/dashboard-header';
import { UserProvider } from '@/hooks/use-user';

export default function DashboardLayout({
  children,
}) {
  return (
    <UserProvider>
      <div className="flex h-screen w-full flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col bg-muted/40 p-4 md:gap-8 md:p-6 pb-16 sm:pb-0">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}