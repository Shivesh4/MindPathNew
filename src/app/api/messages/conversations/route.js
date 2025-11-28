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

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    const byContact = new Map();

    for (const msg of messages) {
      const contactUser =
        msg.senderId === userId ? msg.recipient : msg.sender;
      if (!contactUser) continue;

      if (!byContact.has(contactUser.id)) {
        byContact.set(contactUser.id, {
          id: contactUser.id,
          name: contactUser.name,
          avatarId: contactUser.avatarId,
          lastMessage: msg.content,
          timestamp: msg.timestamp.toISOString(),
          isAI: false,
        });
      }
    }

    const conversations = Array.from(byContact.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}


