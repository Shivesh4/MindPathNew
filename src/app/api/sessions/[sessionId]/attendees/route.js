import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function POST(req, { params }) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    // Check if user is a student
    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can join sessions' },
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
    
    const { sessionId } = params;
    
    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is still upcoming
    if (session.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Cannot join session that is not upcoming' },
        { status: 400 }
      );
    }
    
    // Check if student is already registered for this session
    const existingAttendance = await prisma.sessionAttendee.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: studentRecord.id
        }
      }
    });
    
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'You are already registered for this session' },
        { status: 400 }
      );
    }

    // Check if there is an existing join request
    const existingRequest = await prisma.sessionJoinRequest.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: studentRecord.id
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json(
          { error: 'You already have a pending request for this session' },
          { status: 400 }
        );
      }
      if (existingRequest.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Your request for this session has already been approved' },
          { status: 400 }
        );
      }
      // If previously rejected, allow creating a new request below
    }
    
    // Create a join request for tutor approval
    const joinRequest = await prisma.sessionJoinRequest.create({
      data: {
        sessionId,
        studentId: studentRecord.id,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json(
      { message: 'Join request sent to tutor for approval', request: joinRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    // Check if user is a student
    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can leave sessions' },
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
    
    const { sessionId } = params;
    
    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is still upcoming
    if (session.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Cannot leave session that is not upcoming' },
        { status: 400 }
      );
    }
    
    // Check if student is registered for this session
    const existingAttendance = await prisma.sessionAttendee.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: studentRecord.id
        }
      }
    });
    
    if (!existingAttendance) {
      // If there is a pending join request instead, allow cancelling it
      const existingRequest = await prisma.sessionJoinRequest.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: studentRecord.id
          }
        }
      });

      if (existingRequest && existingRequest.status === 'PENDING') {
        await prisma.sessionJoinRequest.delete({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: studentRecord.id
            }
          }
        });

        return NextResponse.json(
          { message: 'Your join request has been cancelled' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'You are not registered for this session' },
        { status: 400 }
      );
    }
    
    // Remove student from session
    await prisma.sessionAttendee.delete({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: studentRecord.id
        }
      }
    });
    
    return NextResponse.json(
      { message: 'Successfully left session' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error leaving session:', error);
    return NextResponse.json(
      { error: 'Failed to leave session' },
      { status: 500 }
    );
  }
}

// Get all attendees for a session (accessible to tutors and students)
export async function GET(req, { params }) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    const { sessionId } = params;
    
    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view attendees
    // Either the tutor who created the session or a student registered for the session
    const tutorRecord =
      req.user.role === 'TUTOR'
        ? req.user.tutor ??
          (await prisma.tutor.findUnique({
            where: { userId: req.user.id },
            select: { id: true }
          }))
        : null;

    const studentRecord =
      req.user.role === 'STUDENT'
        ? req.user.student ??
          (await prisma.student.findUnique({
            where: { userId: req.user.id },
            select: { id: true }
          }))
        : null;

    const isTutor = req.user.role === 'TUTOR' && tutorRecord?.id === session.tutorId;
    const isStudentAttendee =
      req.user.role === 'STUDENT' && studentRecord?.id
        ? await prisma.sessionAttendee.findUnique({
            where: {
              sessionId_studentId: {
                sessionId: sessionId,
                studentId: studentRecord.id
              }
            }
          })
        : null;
    
    if (!isTutor && !isStudentAttendee) {
      return NextResponse.json(
        { error: 'You do not have permission to view session attendees' },
        { status: 403 }
      );
    }
    
    // Get all attendees for the session
    const attendees = await prisma.sessionAttendee.findMany({
      where: { sessionId: sessionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarId: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({ attendees });
  } catch (error) {
    console.error('Error fetching session attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session attendees' },
      { status: 500 }
    );
  }
}