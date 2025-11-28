import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json(
        { error: 'contactId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: contactId },
          { senderId: contactId, recipientId: userId },
        ],
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const shaped = messages.map((m) => ({
      id: m.id,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      from: m.senderId === userId ? 'me' : 'contact',
    }));

    return NextResponse.json({ messages: shaped });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const userId = req.user.id;
    const body = await req.json().catch(() => ({}));
    const { contactId, content } = body || {};

    if (!contactId || !content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'contactId and non-empty content are required' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId: contactId,
        content: content.trim(),
      },
    });

    return NextResponse.json({
      id: newMessage.id,
      content: newMessage.content,
      timestamp: newMessage.timestamp.toISOString(),
      from: 'me',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}


