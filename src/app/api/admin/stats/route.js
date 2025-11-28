import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get total tutors count
    const totalTutors = await prisma.user.count({
      where: {
        role: 'TUTOR'
      }
    });
    
    // Get active sessions count (sessions that are upcoming or in progress)
    const activeSessions = await prisma.session.count({
      where: {
        status: {
          in: ['UPCOMING', 'IN_PROGRESS']
        }
      }
    });
    
    return NextResponse.json({
      totalUsers,
      totalTutors,
      activeSessions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}