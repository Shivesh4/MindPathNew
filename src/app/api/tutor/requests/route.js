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
        { error: 'Only tutors can view session join requests' },
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

    const { searchParams } = new URL(req.url);
    const statusFilter =
      searchParams.get('status')?.toUpperCase() || 'ALL';

    const whereClause = {
      session: {
        tutorId: tutorRecord.id,
      },
    };

    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const requests = await prisma.sessionJoinRequest.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        session: true,
      },
    });

    const transformed = await Promise.all(
      requests.map(async (reqItem) => {
        const studentUser = reqItem.student.user;
        const previousSessions = await prisma.sessionAttendee.count({
          where: { studentId: reqItem.student.id },
        });

        const date = reqItem.session.dateTime;

        return {
          id: reqItem.id,
          status: reqItem.status.toLowerCase(),
          createdAt: reqItem.createdAt.toISOString(),
          studentName: studentUser.name,
          studentEmail: studentUser.email,
          avatarId: studentUser.avatarId,
          studentLevel: studentUser.academicLevel || 'Student',
          previousSessions,
          sessionId: reqItem.sessionId,
          subject: reqItem.session.title,
          requestedDate: date.toISOString(),
          requestedTime: date.toTimeString().slice(0, 5),
          duration: reqItem.session.duration,
          type: reqItem.session.mode === 'ONLINE' ? 'Online' : 'In-Person',
          message: null,
        };
      })
    );

    return NextResponse.json({ requests: transformed });
  } catch (error) {
    console.error('Error fetching tutor join requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session join requests' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Only tutors can manage session join requests' },
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

    const body = await req.json().catch(() => ({}));
    const { requestId, action } = body || {};

    if (!requestId || !['approve', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'requestId and valid action ("approve" or "deny") are required' },
        { status: 400 }
      );
    }

    const joinRequest = await prisma.sessionJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        session: {
          include: {
            sessionAttendees: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    if (joinRequest.session.tutorId !== tutorRecord.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this request' },
        { status: 403 }
      );
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending requests can be updated' },
        { status: 400 }
      );
    }

    if (action === 'deny') {
      const updated = await prisma.sessionJoinRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ request: updated });
    }

    // Approve flow: check capacity and session status
    if (joinRequest.session.status !== 'UPCOMING') {
      await prisma.sessionJoinRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json(
        { error: 'Cannot approve request for a non-upcoming session' },
        { status: 400 }
      );
    }

    const currentAttendeesCount = joinRequest.session.sessionAttendees.length;
    if (currentAttendeesCount >= joinRequest.session.availableSeats) {
      await prisma.sessionJoinRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json(
        { error: 'Session is full; request cannot be approved' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.sessionAttendee.create({
        data: {
          sessionId: joinRequest.sessionId,
          studentId: joinRequest.studentId,
        },
      });

      await tx.sessionJoinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    });

    const updatedRequest = await prisma.sessionJoinRequest.findUnique({
      where: { id: requestId },
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error('Error updating tutor join request:', error);
    return NextResponse.json(
      { error: 'Failed to update join request' },
      { status: 500 }
    );
  }
}


