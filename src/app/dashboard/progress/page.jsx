'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import StudyPlanCard from '@/components/dashboard/study-plan-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPlans = async () => {
      if (typeof window === 'undefined') return;
      try {
        setLoading(true);
        setError(null);
        const token = window.localStorage.getItem('authToken');
        if (!token) {
          setPlans([]);
          setLoading(false);
          return;
        }
        const response = await fetch('/api/study-plans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load study plans');
        }
        setPlans(Array.isArray(data.plans) ? data.plans : []);
      } catch (err) {
        console.error('Error fetching study plans:', err);
        setError(err.message || 'Failed to load study plans');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

    return (
        <div className="w-full space-y-8">
      <div className="flex items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">My Progress</h1>
                <p className="text-muted-foreground">
                    An overview of your study plans. Click a plan to view its detailed weekly schedule.
                </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ai-study-plan">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Study Plan
          </Link>
        </Button>
            </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          Loading your study plans…
        </div>
      ) : error ? (
        <div className="py-12 text-center text-destructive text-sm">
          {error}
        </div>
      ) : plans.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
                        <StudyPlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            ) : (
                 <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have no active study plans. Get started by creating one!
            </p>
            <Button asChild>
              <Link href="/dashboard/ai-study-plan">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Study Plan
              </Link>
            </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}

