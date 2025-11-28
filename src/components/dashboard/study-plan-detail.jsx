'use client';

import * as React from 'react';
import { studyPlans } from '@/lib/progress-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, BookOpen, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const SubTaskItem = ({ subTask, onSubTaskChange, onSubTaskUpdate, onSubTaskDelete }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [description, setDescription] = React.useState(subTask.description);

    const handleSave = () => {
        onSubTaskUpdate({ ...subTask, description });
        setIsEditing(false);
    };

    return (
        <div key={subTask.id} className="flex items-center gap-3 group">
            <Checkbox 
                id={subTask.id} 
                checked={subTask.completed} 
                onCheckedChange={(checked) => onSubTaskChange(subTask.id, !!checked)}
            />
            {isEditing ? (
                 <div className="flex-grow flex items-center gap-2">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-8" />
                    <Button size="sm" onClick={handleSave}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
            ) : (
                <Label htmlFor={subTask.id} className={cn("text-sm flex-grow", subTask.completed ? "line-through text-muted-foreground" : "")}>
                    {subTask.description}
                </Label>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSubTaskDelete(subTask.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
};

const TaskItem = ({ task, onTaskChange, onTaskUpdate, onTaskDelete }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(task.title);
    const [day, setDay] = React.useState(task.day);
    const [subTasks, setSubTasks] = React.useState(task.subTasks);
    
    React.useEffect(() => {
        setSubTasks(task.subTasks);
    }, [task.subTasks]);

    const completedSubTasks = subTasks.filter(st => st.completed).length;
    const progress = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : (task.completed ? 100 : 0);
    const isTaskCompleted = progress === 100;

    const handleSubTaskChange = (subTaskId, checked) => {
        const newSubTasks = subTasks.map(st => st.id === subTaskId ? { ...st, completed: checked } : st);
        setSubTasks(newSubTasks);
        onTaskChange(task.id, newSubTasks);

        // Persist progress for saved plans (subtasks that exist in the database)
        if (typeof window !== 'undefined') {
            const token = window.localStorage.getItem('authToken');
            if (token) {
                fetch('/api/study-plans/sub-task', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ subTaskId, completed: !!checked }),
                }).catch((err) => {
                    console.error('Failed to persist sub-task progress:', err);
                });
            }
        }
    };

    const handleSubTaskUpdate = (updatedSubTask) => {
        const newSubTasks = subTasks.map(st => st.id === updatedSubTask.id ? updatedSubTask : st);
        onTaskChange(task.id, newSubTasks);
    };

    const handleSubTaskDelete = (subTaskId) => {
        const newSubTasks = subTasks.filter(st => st.id !== subTaskId);
        onTaskChange(task.id, newSubTasks);
    };

    const handleAddSubTask = () => {
        const newSubTask = {
            id: `${task.id}-st${subTasks.length + 1}`,
            description: 'New sub-task',
            completed: false
        };
        const newSubTasks = [...subTasks, newSubTask];
        onTaskChange(task.id, newSubTasks);
    };
    
    const handleSave = () => {
        onTaskUpdate({ ...task, title, day });
        setIsEditing(false);
    };

    return (
        <AccordionItem value={task.id} className="border-b-0">
             <div className={cn("p-3 rounded-lg group", {
                "bg-green-500/10 border-l-4 border-green-500": isTaskCompleted,
                "bg-muted/50": !isTaskCompleted,
             })}>
                {isEditing ? (
                    <div className="space-y-2 p-4">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title" />
                        <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day of week" />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <AccordionTrigger className="flex-grow p-0 hover:no-underline data-[state=open]:pb-4">
                            <div className="flex items-center gap-3 w-full">
                                <CheckCircle className={cn("w-6 h-6 transition-colors", isTaskCompleted ? "text-green-500" : "text-muted-foreground/50")} />
                                <div className="flex-grow text-left">
                                    <p className={cn("font-medium", isTaskCompleted && "line-through text-muted-foreground")}>{task.title}</p>
                                    <p className="text-xs text-muted-foreground">{task.day}</p>
                                </div>
                                <div className="text-xs text-muted-foreground mr-2">
                                    {subTasks.length > 0 ? `${completedSubTasks}/${subTasks.length}` : (isTaskCompleted ? '1/1' : '0/1')}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setIsEditing(true);}}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onTaskDelete(task.id);}}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                )}
                <AccordionContent className="pt-0">
                    <div className="space-y-3 pl-9">
                         {subTasks.length > 0 ? (
                            subTasks.map(subTask => (
                                <SubTaskItem key={subTask.id} subTask={subTask} onSubTaskChange={handleSubTaskChange} onSubTaskUpdate={handleSubTaskUpdate} onSubTaskDelete={handleSubTaskDelete} />
                            ))
                         ) : (
                            <p className="text-sm text-muted-foreground">No sub-tasks for this item.</p>
                         )}
                        <Button variant="ghost" size="sm" onClick={handleAddSubTask}>
                            <Plus className="mr-2 h-4 w-4" /> Add Sub-task
                        </Button>
                    </div>
                </AccordionContent>
            </div>
        </AccordionItem>
    );
};

const WeeklyPlanView = ({ week, onWeekChange, onWeekUpdate, onWeekDelete }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(week.title);
    const [tasks, setTasks] = React.useState(week.tasks);

    React.useEffect(() => {
        setTasks(week.tasks);
    }, [week.tasks]);

    const completedTasks = tasks.filter(t => t.subTasks.every(st => st.completed) || (t.subTasks.length === 0 && t.completed)).length;
    const weeklyProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const handleTaskChange = (taskId, newSubTasks) => {
        const newTasks = tasks.map(t => 
            t.id === taskId 
            ? { ...t, subTasks: newSubTasks, completed: newSubTasks.every(st => st.completed) } 
            : t
        );
        setTasks(newTasks);
        onWeekChange(week.week, newTasks);
    };
    
    const handleTaskUpdate = (updatedTask) => {
        const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        onWeekChange(week.week, newTasks);
    };

    const handleTaskDelete = (taskId) => {
        const newTasks = tasks.filter(t => t.id !== taskId);
        onWeekChange(week.week, newTasks);
    };

    const handleAddTask = () => {
        const newTask = {
            id: `w${week.week}-task-${tasks.length + 1}`,
            title: 'New Task',
            day: 'Monday',
            completed: false,
            subTasks: [],
        };
        const newTasks = [...tasks, newTask];
        onWeekChange(week.week, newTasks);
    };

    const handleSave = () => {
        onWeekUpdate({ ...week, title });
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    {isEditing ? (
                         <div className="flex-grow flex items-center gap-2">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold p-2 h-auto" />
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    ) : (
                        <div className="flex-grow">
                             <CardTitle className="text-xl">Week {week.week}: {week.title}</CardTitle>
                        </div>
                    )}
                     <div className="flex items-center">
                        <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                         <Button variant="destructive" size="icon" onClick={() => onWeekDelete(week.week)} className="ml-2">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="pt-4">
                    <Label className="text-xs text-muted-foreground">Weekly Progress ({completedTasks}/{tasks.length} tasks)</Label>
                    <Progress value={weeklyProgress} className="h-2 mt-1" />
                </div>
            </CardHeader>
            <CardContent>
                {tasks.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-2">
                        {tasks.map(task => <TaskItem key={task.id} task={task} onTaskChange={handleTaskChange} onTaskUpdate={handleTaskUpdate} onTaskDelete={handleTaskDelete} />)}
                    </Accordion>
                ) : (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No tasks for this week.</p>
                    </div>
                )}
                 <Button onClick={handleAddTask} variant="outline" className="mt-4 w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </CardContent>
        </Card>
    );
};

export default function StudyPlanDetail({ initialPlan, onPlanUpdate, isNewPlan = false }) {
    const [studyPlan, setStudyPlan] = React.useState(initialPlan);
    const [isEditingHeader, setIsEditingHeader] = React.useState(false);
    
    React.useEffect(() => {
        // Recalculate progress whenever the plan changes
        const totalTasks = studyPlan.weeklyPlans.reduce((acc, week) => acc + week.tasks.length, 0);
        if (totalTasks === 0) {
            if (studyPlan.overallProgress !== 0) {
                 const updatedPlan = { ...studyPlan, overallProgress: 0 };
                 setStudyPlan(updatedPlan);
                 onPlanUpdate(updatedPlan);
            }
            return;
        };

        const completedTasks = studyPlan.weeklyPlans.reduce((acc, week) => {
            return acc + week.tasks.filter(t => t.subTasks.every(st => st.completed) || (t.subTasks.length === 0 && t.completed)).length;
        }, 0);

        const overallProgress = (completedTasks / totalTasks) * 100;
        
        if (overallProgress !== studyPlan.overallProgress) {
            const updatedPlan = { ...studyPlan, overallProgress };
            setStudyPlan(updatedPlan);
            onPlanUpdate(updatedPlan);
        }
    }, [studyPlan.weeklyPlans, studyPlan.overallProgress, onPlanUpdate]);

    const updatePlan = (updatedPlan) => {
        setStudyPlan(updatedPlan);
        onPlanUpdate(updatedPlan);
    }

    const handleWeekChange = (weekNumber, newTasks) => {
        const newWeeklyPlans = studyPlan.weeklyPlans.map(w => 
            w.week === weekNumber ? { ...w, tasks: newTasks } : w);
        updatePlan({ ...studyPlan, weeklyPlans: newWeeklyPlans });
    };

    const handleWeekUpdate = (updatedWeek) => {
        const newWeeklyPlans = studyPlan.weeklyPlans.map(w =>
            w.week === updatedWeek.week ? updatedWeek : w);
        updatePlan({ ...studyPlan, weeklyPlans: newWeeklyPlans });
    };

    const handleWeekDelete = (weekNumber) => {
        const newWeeklyPlans = studyPlan.weeklyPlans.filter(w => w.week !== weekNumber);
        updatePlan({ ...studyPlan, weeklyPlans: newWeeklyPlans });
    };

    const handleAddWeek = () => {
        const newWeek = {
            week: studyPlan.weeklyPlans.length > 0 ? Math.max(...studyPlan.weeklyPlans.map(w => w.week)) + 1 : 1,
            title: 'New Week',
            tasks: []
        };
        const newWeeklyPlans = [...studyPlan.weeklyPlans, newWeek];
        updatePlan({ ...studyPlan, weeklyPlans: newWeeklyPlans });
    };

    const handleHeaderSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const subject = formData.get('subject');
        const focusArea = formData.get('focusArea');

        updatePlan({ ...studyPlan, subject, focusArea });
        setIsEditingHeader(false);
    };

    return (
        <div className="w-full space-y-8">
            <Card>
                {!isNewPlan && (
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Link href="/dashboard/progress" className="hover:text-primary">My Progress</Link>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <span className="text-foreground font-medium">{studyPlan.subject}</span>
                        </div>
                    )}
                    {isEditingHeader ? (
                         <form onSubmit={handleHeaderSave} className="space-y-4">
                            <Input name="subject" defaultValue={studyPlan.subject} className="text-3xl font-bold p-2 h-auto" />
                            <Textarea name="focusArea" defaultValue={studyPlan.focusArea} />
                            <div className="flex gap-2">
                                <Button type="submit">Save</Button>
                                <Button variant="ghost" onClick={() => setIsEditingHeader(false)}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-3xl">
                                        <BookOpen className="w-8 h-8 text-primary" />
                                        {studyPlan.subject}
                                    </CardTitle>
                                    <CardDescription>
                                        {studyPlan.focusArea}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setIsEditingHeader(true)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    )}
                <CardContent>
                    <Label className="text-xs text-muted-foreground">Overall Plan Progress</Label>
                    <Progress value={studyPlan.overallProgress} className="h-3 mt-1" />
                </CardContent>
            </Card>

            <div className="space-y-6">
                {studyPlan.weeklyPlans.map(week => (
                    <WeeklyPlanView key={week.week} week={week} onWeekChange={handleWeekChange} onWeekUpdate={handleWeekUpdate} onWeekDelete={handleWeekDelete} />
                ))}
            </div>
             <Button onClick={handleAddWeek} variant="secondary" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Week
            </Button>
        </div>
    );
}

    