import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(req, { params }) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const { tutorId } = params;
    if (!tutorId) {
      return NextResponse.json(
        { error: 'Tutor ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status')?.toUpperCase() || 'UPCOMING';
    const includePast = searchParams.get('includePast') === 'true';

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarId: true,
            bio: true,
            location: true
          }
        }
      }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const whereClause = {
      tutorId,
      ...(statusParam !== 'ALL' ? { status: statusParam } : {}),
      ...(includePast
        ? {}
        : {
            dateTime: {
              gte: now
            }
          })
    };

    const studentRecord =
      req.user.role === 'STUDENT'
        ? req.user.student ??
          (await prisma.student.findUnique({
            where: { userId: req.user.id },
            select: { id: true }
          }))
        : null;

    const tutorRecord =
      req.user.role === 'TUTOR'
        ? req.user.tutor ??
          (await prisma.tutor.findUnique({
            where: { userId: req.user.id },
            select: { id: true }
          }))
        : null;

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: {
        dateTime: 'asc'
      },
      include: {
        sessionAttendees: {
          select: {
            studentId: true
          }
        }
      }
    });

    const tutorSummary = {
      id: tutor.id,
      userId: tutor.userId,
      name: tutor.user?.name ?? '',
      avatarId: tutor.user?.avatarId ?? null,
      rating: tutor.rating,
      reviews: tutor.reviews,
      experience: tutor.experience,
      subjects: tutor.subjects,
      bio: tutor.bio ?? tutor.user?.bio ?? '',
      location: tutor.user?.location ?? null,
      availability: tutor.availability ?? null
    };

    const sessionsPayload = sessions.map((session) => {
      const isAttending =
        req.user.role === 'STUDENT' && studentRecord?.id
          ? session.sessionAttendees.some(
              (attendee) => attendee.studentId === studentRecord.id
            )
          : false;

      const isOwner =
        req.user.role === 'TUTOR' && tutorRecord?.id === session.tutorId;

      return {
        id: session.id,
        tutorId: session.tutorId,
        title: session.title,
        description: session.description || '',
        dateTime: session.dateTime.toISOString(),
        duration: session.duration,
        mode: session.mode,
        meetingLink: session.meetingLink || null,
        location: session.location || null,
        availableSeats: session.availableSeats,
        currentAttendees: session.sessionAttendees.length,
        status: session.status.toLowerCase(),
        sessionType: session.sessionType || null,
        isAttending,
        isOwner
      };
    });

    return NextResponse.json({
      tutor: tutorSummary,
      sessions: sessionsPayload,
      filters: {
        status: statusParam,
        includePast
      }
    });
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor sessions' },
      { status: 500 }
    );
  }
}

