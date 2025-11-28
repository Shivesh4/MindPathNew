import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get recent tutor applications (limit to 5)
    const tutorApplications = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        tutor: {
          select: {
            subjects: true
          }
        },
        isApproved: true
      }
    });
    
    // Format the data for the frontend
    const formattedApplications = tutorApplications.map(tutor => ({
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      subject: tutor.tutor?.subjects?.[0] || 'Not specified',
      status: tutor.isApproved ? 'Approved' : 'Pending'
    }));
    
    return NextResponse.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching tutor applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor applications' },
      { status: 500 }
    );
  }
}