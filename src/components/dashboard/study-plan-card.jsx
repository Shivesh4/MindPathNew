'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { BookOpen, CheckCircle, ListTodo } from 'lucide-react';
import Link from 'next/link';

export default function StudyPlanCard({ plan }) {
    const totalTasks = plan.weeklyPlans.reduce((acc, week) => acc + week.tasks.length, 0);
    const completedTasks = plan.weeklyPlans.reduce((acc, week) => {
        return acc + week.tasks.filter(t => t.subTasks.every(st => st.completed)).length;
    }, 0);

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return (
        <Link href={`/dashboard/progress/${plan.id}`} className="block transition-transform transform hover:-translate-y-1">
            <Card className="flex flex-col h-full hover:shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl mb-1">
                        <BookOpen className="w-5 h-5 text-primary" />
                        {plan.subject}
                    </CardTitle>
                    <CardDescription>{plan.focusArea}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                    <div>
                        <Label className="text-xs text-muted-foreground">Overall Progress</Label>
                        <Progress value={progress} className="h-2 mt-1" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-1.5">
                            <ListTodo className="w-4 h-4" />
                            <span>{totalTasks} total tasks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{completedTasks} completed</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}