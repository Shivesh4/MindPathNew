import { studyPlans } from '@/lib/progress-data';
import { prisma } from '@/lib/db';
import StudyPlanClientPage from './client-page';

export async function generateStaticParams() {
    return studyPlans.map((plan) => ({
        planId: plan.id,
    }));
}

function mapDbPlanToUi(plan) {
    return {
        id: plan.id,
        subject: plan.subject,
        focusArea: plan.focusArea,
        overallProgress: plan.overallProgress ?? 0,
        weeklyPlans: plan.weeklyPlans
            .sort((a, b) => a.weekNumber - b.weekNumber)
            .map((week) => ({
                week: week.weekNumber,
                title: week.title,
                tasks: week.tasks.map((task) => ({
                    id: task.id,
                    title: task.title,
                    day: task.day || '',
                    completed: task.completed,
                    subTasks: task.subTasks.map((st) => ({
                        id: st.id,
                        description: st.description,
                        completed: st.completed,
                    })),
                })),
            })),
    };
}

async function getStudyPlan(planId) {
    const staticPlan = studyPlans.find(p => p.id === planId);
    if (staticPlan) return staticPlan;

    const dbPlan = await prisma.studyPlan.findUnique({
        where: { id: planId },
        include: {
            weeklyPlans: {
                include: {
                    tasks: {
                        include: {
                            subTasks: true,
                        },
                    },
                },
            },
        },
    });

    if (!dbPlan) return null;
    return mapDbPlanToUi(dbPlan);
}

export default async function StudyPlanDetailPage({ params }) {
    const { planId } = await params;
    const studyPlan = await getStudyPlan(planId);

    return <StudyPlanClientPage initialStudyPlan={studyPlan} />;
}

