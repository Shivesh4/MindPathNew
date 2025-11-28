// AI Assisted code, model name : Gemini 2.5 Pro Prompt : Create a consistent tutor layout structure with header navigation and responsive main content area
import TutorDashboardHeader from '@/components/tutor/tutor-dashboard-header';
import { UserProvider } from '@/contexts/user-context';

export default function TutorLayout({
  children,
}) {
  return (
    <UserProvider>
      <div className="flex h-screen w-full flex-col">
        <TutorDashboardHeader />
        <main className="flex flex-1 flex-col bg-muted/40 p-4 md:gap-8 md:p-6 pb-16 sm:pb-0">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}