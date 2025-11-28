// AI Assisted code, model name : Gemini 2.5 Pro Prompt : Create a comprehensive student dashboard with study planner, notifications, and responsive grid layout for academic progress tracking
import Notifications from '@/components/dashboard/notifications';
import StudyPlanner from '@/components/dashboard/study-planner';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your academic progress and activities.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <StudyPlanner />
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-1">
          <Notifications />
        </div>
      </div>
    </div>
  );
}