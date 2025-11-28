'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import StudyPlanDetail from '@/components/dashboard/study-plan-detail';
import { studyPlans } from '@/lib/progress-data';

export default function StudyPlanClientPage({ initialStudyPlan }) {
    const [studyPlan, setStudyPlan] = React.useState(initialStudyPlan);

    const handlePlanUpdate = (updatedPlan) => {
        setStudyPlan(updatedPlan);

        // Update the master data list
        const planIndex = studyPlans.findIndex(p => p.id === updatedPlan.id);
        if (planIndex !== -1) {
            studyPlans[planIndex] = updatedPlan;
        }
    };

    if (!studyPlan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading study plan...</p>
                 <Button variant="link" asChild className="mt-4">
                    <Link href="/dashboard/progress">Back to Progress</Link>
                </Button>
            </div>
        );
    }

    return (
        <StudyPlanDetail
            initialPlan={studyPlan}
            onPlanUpdate={handlePlanUpdate}
        />
    );
}

