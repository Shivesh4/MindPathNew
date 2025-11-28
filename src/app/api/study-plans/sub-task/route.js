import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function PATCH(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can update study plan progress' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { subTaskId, completed } = body || {};

    if (!subTaskId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'subTaskId and completed flag are required' },
        { status: 400 }
      );
    }

    // Resolve current student's record
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

    // Ensure the subtask belongs to a plan owned by this student
    const subTask = await prisma.subTask.findUnique({
      where: { id: subTaskId },
      include: {
        task: {
          include: {
            weeklyPlan: {
              include: {
                studyPlan: true,
              },
            },
          },
        },
      },
    });

    if (
      !subTask ||
      subTask.task.weeklyPlan.studyPlan.studentId !== studentRecord.id
    ) {
      return NextResponse.json(
        { error: 'Sub-task not found for this student' },
        { status: 404 }
      );
    }

    await prisma.subTask.update({
      where: { id: subTaskId },
      data: { completed },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating sub-task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update sub-task progress' },
      { status: 500 }
    );
  }
}


