import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(req) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    // Check if user is a student
    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can browse sessions' },
        { status: 403 }
      );
    }

    const studentRecord =
      req.user.student ??
      (await prisma.student.findUnique({
        where: { userId: req.user.id },
        select: { id: true }
      }));

    if (!studentRecord?.id) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || '';
    const mode = searchParams.get('mode') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {
      status: 'UPCOMING',
      dateTime: {
        gte: new Date() // Only future sessions
      }
    };
    
    // Add subject filter if provided
    if (subject) {
      whereClause.title = {
        contains: subject,
        mode: 'insensitive'
      };
    }
    
    // Add mode filter if provided
    if (mode) {
      whereClause.mode = mode.toUpperCase();
    }
    
    // Get total count for pagination
    const totalCount = await prisma.session.count({ where: whereClause });
    
    // Fetch sessions with attendee counts
    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: {
        dateTime: 'asc'
      },
      skip,
      take: limit,
      include: {
        sessionAttendees: {
          select: {
            studentId: true
          }
        },
        tutor: {
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
        }
      }
    });
    
    // Transform sessions data for frontend
    const transformedSessions = sessions.map((session) => {
      const isAttending = session.sessionAttendees.some(
        (attendee) => attendee.studentId === studentRecord.id
      );

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
        description: session.description || '',
        dateTime: session.dateTime.toISOString(),
        duration: session.duration,
        mode: session.mode,
        meetingLink: session.meetingLink || null,
        location: session.location || null,
        availableSeats: session.availableSeats,
        currentAttendees: session.sessionAttendees.length,
        isAttending,
        status: session.status.toLowerCase()
      };
    });
    
    return NextResponse.json({ 
      sessions: transformedSessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}