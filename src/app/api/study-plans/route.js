import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

function mapDbPlanToUi(plan) {
  // Compute overall progress from tasks/subtasks so it stays in sync
  const allTasks = plan.weeklyPlans.flatMap((w) => w.tasks);
  const totalTasks = allTasks.length;
  const completedTasks =
    totalTasks === 0
      ? 0
      : allTasks.filter(
          (t) =>
            (t.subTasks.length > 0 &&
              t.subTasks.every((st) => st.completed)) ||
            (t.subTasks.length === 0 && t.completed)
        ).length;

  const overallProgress =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    id: plan.id,
    subject: plan.subject,
    focusArea: plan.focusArea,
    overallProgress,
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

export async function GET(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can view study plans' },
        { status: 403 }
      );
    }

    const studentRecord =
      req.user.student ??
      (await prisma.student.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      }));

    if (!studentRecord?.id) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const plans = await prisma.studyPlan.findMany({
      where: { studentId: studentRecord.id },
      orderBy: { createdAt: 'desc' },
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

    const uiPlans = plans.map(mapDbPlanToUi);

    return NextResponse.json({ plans: uiPlans });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study plans' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can create study plans' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { plan } = body || {};

    if (!plan || !plan.subject || !Array.isArray(plan.weeklyPlans)) {
      return NextResponse.json(
        { error: 'Invalid plan payload' },
        { status: 400 }
      );
    }

    const studentRecord =
      req.user.student ??
      (await prisma.student.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      }));

    if (!studentRecord?.id) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const createdPlan = await prisma.studyPlan.create({
      data: {
        studentId: studentRecord.id,
        subject: plan.subject,
        focusArea: plan.focusArea || '',
        overallProgress:
          typeof plan.overallProgress === 'number'
            ? plan.overallProgress
            : 0,
        weeklyPlans: {
          create: plan.weeklyPlans.map((week) => ({
            weekNumber: week.week,
            title: week.title || `Week ${week.week}`,
            tasks: {
              create:
                Array.isArray(week.tasks) && week.tasks.length > 0
                  ? week.tasks.map((task) => ({
                      title: task.title || 'Study task',
                      day: task.day || '',
                      completed: false,
                      subTasks: {
                        create:
                          Array.isArray(task.subTasks) &&
                          task.subTasks.length > 0
                            ? task.subTasks.map((st) => ({
                                description: st.description || 'Sub-task',
                                completed: false,
                              }))
                            : [],
                      },
                    }))
                  : [],
            },
          })),
        },
      },
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

    const uiPlan = mapDbPlanToUi(createdPlan);

    return NextResponse.json({ plan: uiPlan }, { status: 201 });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json(
      { error: 'Failed to create study plan' },
      { status: 500 }
    );
  }
}


