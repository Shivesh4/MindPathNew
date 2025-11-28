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
    
    // Check if user is a tutor
    if (req.user.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Only tutors can access sessions' },
        { status: 403 }
      );
    }

    // Resolve tutor record (user relation may not always be loaded)
    const tutorRecord =
      req.user.tutor ??
      (await prisma.tutor.findUnique({
        where: { userId: req.user.id },
        select: { id: true }
      }));

    if (!tutorRecord?.id) {
      return NextResponse.json(
        { error: 'Tutor profile not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = { tutorId: tutorRecord.id };
    if (status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    // Get total count for pagination
    const totalCount = await prisma.session.count({ where: whereClause });
    
    // Fetch sessions for the current tutor with attendee counts
    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: {
        dateTime: 'desc'
      },
      skip,
      take: limit,
      include: {
        sessionAttendees: true
      }
    });

    // Transform sessions data for frontend
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      subject: session.title,
      sessionType: session.sessionType || 'Regular Session', // Use the sessionType field
      date: session.dateTime.toISOString().split('T')[0],
      time: session.dateTime.toTimeString().slice(0, 5),
      duration: session.duration,
      type: session.mode === 'ONLINE' ? 'Online' : 'In-Person',
      status: session.status.toLowerCase(),
      notes: session.description || '',
      location: session.mode === 'ONLINE' ? session.meetingLink || 'Online Meeting' : session.location || 'In Person',
      maxAttendee: session.availableSeats,
      availableSeats: session.availableSeats,
      attendees: session.sessionAttendees.map(attendee => ({
        id: attendee.id,
        studentId: attendee.studentId
      }))
    }));

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
    console.error('Error fetching tutor sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    // Check if user is a tutor
    if (req.user.role !== 'TUTOR') {
      return NextResponse.json(
        { error: 'Only tutors can create sessions' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.subject || !body.date || !body.time || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, date, time, and duration are required' },
        { status: 400 }
      );
    }

    const availableSeatsInput = body.availableSeats ?? body.maxAttendee;
    const availableSeats = Number(availableSeatsInput);

    if (!Number.isFinite(availableSeats) || availableSeats <= 0) {
      return NextResponse.json(
        { error: 'Available seats must be a positive number' },
        { status: 400 }
      );
    }
    
    // Get tutor
    const tutor =
      req.user.tutor ??
      (await prisma.tutor.findUnique({
        where: { userId: req.user.id },
        select: { id: true }
      }));

    if (!tutor?.id) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Validate and parse date/time
    let dateTime;
    try {
      dateTime = new Date(`${body.date}T${body.time}`);
      if (isNaN(dateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }
    } catch (dateError) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    // Prevent duplicate sessions for the same tutor, date, and time
    const existingSession = await prisma.session.findFirst({
      where: {
        tutorId: tutor.id,
        dateTime,
      }
    });

    if (existingSession) {
      return NextResponse.json(
        {
          error: 'A session already exists at the selected date and time.',
          sessionId: existingSession.id
        },
        { status: 409 }
      );
    }

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        tutorId: tutor.id,
        title: body.subject,
        sessionType: body.sessionType, // Add sessionType to the data
        description: body.notes || '',
        dateTime: dateTime,
        duration: body.duration,
        mode: body.type === 'Online' ? 'ONLINE' : 'OFFLINE',
        meetingLink: body.type === 'Online' ? body.location : null,
        location: body.type === 'In-Person' ? body.location : null,
        availableSeats,
        status: 'UPCOMING'
      }
    });

    // Transform session data for frontend
    const transformedSession = {
      id: newSession.id,
      subject: newSession.title,
      sessionType: newSession.sessionType || 'Regular Session', // Add sessionType to response
      date: newSession.dateTime.toISOString().split('T')[0],
      time: newSession.dateTime.toTimeString().slice(0, 5),
      duration: newSession.duration,
      type: newSession.mode === 'ONLINE' ? 'Online' : 'In-Person',
      status: newSession.status.toLowerCase(),
      notes: newSession.description || '',
      location: newSession.mode === 'ONLINE' ? newSession.meetingLink || 'Online Meeting' : newSession.location || 'In Person',
      maxAttendee: newSession.availableSeats,
      availableSeats: newSession.availableSeats,
      attendees: [] // New sessions have no attendees initially
    };

    return NextResponse.json({ session: transformedSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}