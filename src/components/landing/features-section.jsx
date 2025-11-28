import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BotMessageSquare, BrainCircuit, CalendarCheck2, LayoutDashboard, UsersRound } from 'lucide-react';

const features = [
  {
    icon: <BotMessageSquare className="w-8 h-8 text-secondary" />,
    title: 'User Management',
    description: 'Create and manage tutor/student profiles with bios, skills, schedules, and ratings.',
  },
  {
    icon: <UsersRound className="w-8 h-8 text-secondary" />,
    title: 'Tutor Matching & Booking',
    description: 'Find the right tutor, schedule sessions, manage cancellations, and leave reviews seamlessly.',
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-tertiary" />,
    title: 'Study Planning Module',
    description: 'Utilize task tracking, calendar views, and progress dashboards to organize your studies.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-ai-accent" />,
    title: 'AI TutorBot',
    description: 'Get instant answers to your study questions with our intelligent AI-powered chatbot.',
  },
  {
    icon: <CalendarCheck2 className="w-8 h-8 text-ai-accent" />,
    title: 'AI Study Planner',
    description: 'Let our AI automatically generate an optimized and personalized study schedule for you.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/50">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            A Powerful Toolkit for Modern Learning
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to succeed, integrated into one smart platform.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 transition-transform transform hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4">{feature.icon}</div>
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2 text-sm">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
