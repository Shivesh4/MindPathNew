import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can view their sessions' },
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

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status')?.toUpperCase() ?? 'ALL';

    const whereClause = {
      sessionAttendees: {
        some: {
          studentId: studentRecord.id,
        },
      },
    };

    if (statusParam !== 'ALL') {
      whereClause.status = statusParam;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: {
        dateTime: 'asc',
      },
      include: {
        sessionAttendees: {
          select: {
            studentId: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarId: true,
                bio: true,
                location: true,
              },
            },
          },
        },
      },
    });

    const transformedSessions = sessions.map((session) => {
      const attendeeIds = session.sessionAttendees.map((attendee) => attendee.studentId);

      const tutorUser = session.tutor?.user;
      const tutorSummary = session.tutor
        ? {
            id: session.tutor.id,
            userId: session.tutor.userId,
            name: tutorUser?.name ?? '',
            avatarId: tutorUser?.avatarId ?? null,
            rating: session.tutor.rating,
            reviews: session.tutor.reviews,
            experience: session.tutor.experience,
            subjects: session.tutor.subjects,
            bio: session.tutor.bio ?? tutorUser?.bio ?? '',
            location: tutorUser?.location ?? null,
          }
        : null;

      return {
        id: session.id,
        tutorId: session.tutorId,
        tutor: tutorSummary,
        title: session.title,
        description: session.description ?? '',
        dateTime: session.dateTime.toISOString(),
        duration: session.duration,
        mode: session.mode.toLowerCase(),
        meetingLink: session.meetingLink ?? null,
        location: session.location ?? null,
        availableSeats: session.availableSeats,
        attendees: attendeeIds,
        status: session.status.toLowerCase(),
      };
    });

    return NextResponse.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}



