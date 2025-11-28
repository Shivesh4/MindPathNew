import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userIds, role } = body || {};

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    if (!action || !['delete', 'updateRole', 'approveTutors'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid or missing action' },
        { status: 400 }
      );
    }

    if (action === 'updateRole') {
      if (!role || !['STUDENT', 'TUTOR', 'ADMIN'].includes(role)) {
        return NextResponse.json(
          { error: 'Valid role is required for updateRole' },
          { status: 400 }
        );
      }
    }

    const results = {
      processed: 0,
      deleted: [],
      updated: [],
      skipped: [],
      failed: [],
    };

    for (const id of userIds) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
          results.skipped.push({ id, reason: 'not_found' });
          continue;
        }

        if (action === 'delete') {
          if (user.role === 'ADMIN') {
            results.skipped.push({ id, reason: 'admin_protected' });
            continue;
          }

          if (user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({
              where: { userId: id },
            });
            if (student) {
              await prisma.review.deleteMany({
                where: { studentId: student.id },
              });
              await prisma.sessionAttendee.deleteMany({
                where: { studentId: student.id },
              });
              await prisma.studyPlan.deleteMany({
                where: { studentId: student.id },
              });
              await prisma.student.delete({
                where: { id: student.id },
              });
            }
          } else if (user.role === 'TUTOR') {
            const tutor = await prisma.tutor.findUnique({
              where: { userId: id },
            });
            if (tutor) {
              await prisma.review.deleteMany({
                where: { tutorId: tutor.id },
              });
              await prisma.session.deleteMany({
                where: { tutorId: tutor.id },
              });
              await prisma.tutor.delete({
                where: { id: tutor.id },
              });
            }
          }

          await prisma.message.deleteMany({
            where: { senderId: id },
          });
          await prisma.message.deleteMany({
            where: { recipientId: id },
          });
          await prisma.notification.deleteMany({
            where: { userId: id },
          });
          await prisma.user.delete({ where: { id } });
          results.deleted.push(id);
        } else if (action === 'updateRole') {
          // Prevent demoting admins
          if (user.role === 'ADMIN' && role !== 'ADMIN') {
            results.skipped.push({ id, reason: 'admin_protected' });
            continue;
          }

          const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
          });
          results.updated.push({
            id: updatedUser.id,
            role: updatedUser.role,
          });
        } else if (action === 'approveTutors') {
          if (user.role !== 'TUTOR') {
            results.skipped.push({ id, reason: 'not_tutor' });
            continue;
          }
          const updatedUser = await prisma.user.update({
            where: { id },
            data: { isApproved: true },
          });
          results.updated.push({
            id: updatedUser.id,
            isApproved: updatedUser.isApproved,
          });
        }

        results.processed += 1;
      } catch (err) {
        console.error(`Bulk action error for user ${id}:`, err);
        results.failed.push({ id, error: 'internal_error' });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing bulk user action:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk user action' },
      { status: 500 }
    );
  }
}


