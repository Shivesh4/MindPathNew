// AI Assisted code, model name : Gemini 2.5 Pro Prompt : Create a clean and consistent admin layout structure with header navigation and responsive design
import AdminDashboardHeader from "@/components/admin/admin-dashboard-header"
import { UserProvider } from '@/hooks/use-user';

export default function AdminLayout({ children }) {
    return (
        <UserProvider>
          <div className="flex h-screen w-full flex-col">
              <AdminDashboardHeader />
              <main className="flex flex-1 flex-col bg-muted/40 p-0 md:gap-8 md:p-0">
                  {children}
              </main>
          </div>
        </UserProvider>
    )
}