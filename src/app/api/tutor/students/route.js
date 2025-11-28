import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Only tutors can view their students' },
        { status: 403 }
      );
    }

    const tutorRecord =
      req.user.tutor ??
      (await prisma.tutor.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      }));

    if (!tutorRecord?.id) {
      return NextResponse.json(
        { error: 'Tutor profile not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    const students = await prisma.student.findMany({
      where: {
        sessionAttendees: {
          some: {
            session: {
              tutorId: tutorRecord.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarId: true,
          },
        },
        sessionAttendees: {
          include: {
            session: true,
          },
        },
        reviews: {
          where: {
            tutorId: tutorRecord.id,
          },
        },
      },
    });

    const transformed = students.map((student) => {
      const sessions = student.sessionAttendees.map((sa) => sa.session);
      const totalSessions = sessions.length;
      const sortedSessions = [...sessions].sort(
        (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
      );

      const pastSessions = sortedSessions.filter(
        (s) => s.dateTime.getTime() <= now.getTime()
      );
      const upcomingSessions = sortedSessions.filter(
        (s) => s.dateTime.getTime() > now.getTime()
      );

      const lastSession = pastSessions[pastSessions.length - 1] ?? null;
      const nextSession = upcomingSessions[0] ?? null;

      const averageRating =
        student.reviews.length > 0
          ? student.reviews.reduce((sum, r) => sum + r.rating, 0) /
            student.reviews.length
          : null;

      const status =
        upcomingSessions.length > 0 || pastSessions.length > 0
          ? 'active'
          : 'inactive';

      const subjectsSet = new Set(
        sessions
          .map((s) => s.title)
          .filter((t) => typeof t === 'string' && t.trim().length > 0)
      );

      return {
        id: student.user.id,
        name: student.user.name,
        email: student.user.email,
        avatarId: student.user.avatarId,
        subjects: Array.from(subjectsSet),
        totalSessions,
        lastSessionDate: lastSession ? lastSession.dateTime.toISOString() : null,
        nextSessionDate: nextSession ? nextSession.dateTime.toISOString() : null,
        averageRating,
        status,
        joinDate:
          sortedSessions[0]?.dateTime.toISOString() ??
          student.user.createdAt?.toISOString?.() ??
          null,
      };
    });

    return NextResponse.json({ students: transformed });
  } catch (error) {
    console.error('Error fetching tutor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}


