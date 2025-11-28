'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import StudyPlanDetail from '@/components/dashboard/study-plan-detail';

export default function AIStudyPlanPage() {
  const router = useRouter();
  const [subject, setSubject] = React.useState('');
  const [focusArea, setFocusArea] = React.useState('');
  const [weeks, setWeeks] = React.useState(2);
  const [hoursPerWeek, setHoursPerWeek] = React.useState(6);
  const [difficulty, setDifficulty] = React.useState('medium');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [plan, setPlan] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('authToken')
          : null;
      if (!token) {
        throw new Error('You must be logged in as a student to generate a plan.');
      }

      const response = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          focusArea: focusArea.trim(),
          weeks: Number(weeks) || 2,
          hoursPerWeek: Number(hoursPerWeek) || 6,
          difficulty,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study plan');
      }

      setPlan(data.plan);
    } catch (err) {
      console.error('Error generating AI study plan:', err);
      setError(err.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    try {
      setSaving(true);
      setSaveError(null);

      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('authToken')
          : null;
      if (!token) {
        throw new Error('You must be logged in as a student to save a plan.');
      }

      const response = await fetch('/api/study-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save study plan');
      }

      router.push('/dashboard/progress');
    } catch (err) {
      console.error('Error saving study plan:', err);
      setSaveError(err.message || 'Failed to save study plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Study Planner
          </h1>
          <p className="text-muted-foreground">
            Describe what you&apos;re studying and MindPath will generate a structured, weekly study plan.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/progress')}>
          Back to My Progress
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan inputs</CardTitle>
          <CardDescription>
            The more context you provide, the better the plan (exam date, current level, specific topics, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleGenerate}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Calculus II, Data Structures, Organic Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="focusArea">Focus area / goals</Label>
              <Textarea
                id="focusArea"
                placeholder="e.g. Integration techniques and series tests, preparing for midterm on chapters 5–7."
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeks">Number of weeks</Label>
              <Input
                id="weeks"
                type="number"
                min={1}
                max={12}
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Hours per week</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                min={1}
                max={40}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-end justify-end md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating plan…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Plan with AI
                  </>
                )}
              </Button>
            </div>
          </form>
          {error && (
            <p className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle>Generated plan</CardTitle>
            <CardDescription>
              This plan is AI-generated. You can edit tasks and weeks locally; persistence to your account will be added later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudyPlanDetail
              initialPlan={plan}
              onPlanUpdate={setPlan}
              isNewPlan={true}
            />
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Review and tweak the plan. When you&apos;re happy, save it so it shows up under My Progress.
              </p>
              <div className="flex items-center gap-3">
                {saveError && (
                  <span className="text-xs text-destructive">{saveError}</span>
                )}
                <Button onClick={handleSavePlan} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save Study Plan'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


