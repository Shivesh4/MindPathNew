'use client';

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { studyPlans as staticStudyPlans } from "@/lib/progress-data";

function getTodayName() {
  return new Date().toLocaleDateString(undefined, { weekday: "long" });
}

export default function StudyPlanner() {
  const [savedPlans, setSavedPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPlans = async () => {
      if (typeof window === "undefined") return;
      try {
        setLoading(true);
        setError(null);
        const token = window.localStorage.getItem("authToken");
        if (!token) {
          setSavedPlans([]);
          setLoading(false);
          return;
        }
        const response = await fetch("/api/study-plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Failed to load study plans");
        }
        setSavedPlans(Array.isArray(data.plans) ? data.plans : []);
      } catch (err) {
        console.error("Error fetching study plans for dashboard:", err);
        setError(err.message || "Failed to load study plans");
        setSavedPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const allPlans = [...savedPlans, ...staticStudyPlans];
  const activePlan = allPlans[0];

  let todayTasks = [];
  if (activePlan) {
    const todayName = getTodayName();
    todayTasks = activePlan.weeklyPlans.flatMap((week) =>
      week.tasks.filter(
        (task) =>
          (task.day || "").toLowerCase() === todayName.toLowerCase()
      )
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Study Planner</CardTitle>
            <CardDescription className="text-xs">
              Quick view of your current study plans and today&apos;s tasks.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href="/dashboard/ai-study-plan">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Create Study Plan</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">
            Loading your study plans…
          </p>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : !activePlan ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any study plans yet. Create one to get a
              personalized schedule.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/ai-study-plan">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Study Plan
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active plan summary */}
            <div className="p-4 rounded-lg bg-muted/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {activePlan.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activePlan.focusArea}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Overall progress
                  </p>
                  <p className="text-sm font-semibold">
                    {Math.round(activePlan.overallProgress)}%
                  </p>
                </div>
              </div>
              <Progress
                value={activePlan.overallProgress}
                className="mt-2 h-2"
              />
            </div>

            {/* Today / upcoming tasks */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Today&apos;s focus</p>
              {todayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No specific tasks scheduled for today. Check your full plan
                  in the{" "}
                  <Link
                    href="/dashboard/progress"
                    className="underline underline-offset-2"
                  >
                    Progress
                  </Link>{" "}
                  page.
                </p>
              ) : (
                todayTasks.slice(0, 3).map((task) => {
                  const totalSubTasks = task.subTasks.length;
                  const completedSubTasks = task.subTasks.filter(
                    (st) => st.completed
                  ).length;
                  const progress =
                    totalSubTasks > 0
                      ? (completedSubTasks / totalSubTasks) * 100
                      : task.completed
                      ? 100
                      : 0;

                  const icon =
                    progress === 100 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    );

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border bg-background/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {icon}
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.day}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {completedSubTasks}/{totalSubTasks || 1} done
                        </p>
                      </div>
                      <Progress value={progress} className="mt-2 h-1.5" />
                      {task.subTasks.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {task.subTasks.slice(0, 2).map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Checkbox
                                checked={st.completed}
                                className="h-3 w-3"
                                disabled
                              />
                              <Label
                                className={
                                  st.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
                                {st.description}
                              </Label>
                            </div>
                          ))}
                          {task.subTasks.length > 2 && (
                            <p className="text-[11px] text-muted-foreground">
                              +{task.subTasks.length - 2} more sub-tasks
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

