import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function PUT(req, { params }) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }
    
    if (req.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Only tutors can update sessions' }, { status: 403 });
    }

    const tutorRecord =
      req.user.tutor ??
      (await prisma.tutor.findUnique({
        where: { userId: req.user.id },
        select: { id: true }
      }));

    if (!tutorRecord?.id) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }
    
    const { sessionId } = params;
    const body = await req.json();
    
    const { date, time } = body;
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    const dateTime = new Date(`${date}T${time}`);
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: String(sessionId) },
    });

    if (!session || session.tutorId !== tutorRecord.id) {
      return NextResponse.json({ error: 'Session not found or you do not have permission to update it' }, { status: 404 });
    }

    const updatedSession = await prisma.session.update({
      where: { id: String(sessionId) },
      data: {
        dateTime: dateTime,
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
