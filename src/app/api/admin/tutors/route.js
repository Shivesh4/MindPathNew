import { getPendingTutorApprovals, approveTutor, rejectTutor } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get pending tutor approvals
    const pendingTutors = await getPendingTutorApprovals();
    
    return NextResponse.json({
      tutors: pendingTutors
    });
  } catch (error) {
    console.error('Error fetching pending tutors:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching pending tutors' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { userId, action } = await request.json();
    
    if (action === 'approve') {
      await approveTutor(userId);
      return NextResponse.json({
        message: 'Tutor approved successfully'
      });
    } else if (action === 'reject') {
      await rejectTutor(userId);
      return NextResponse.json({
        message: 'Tutor rejected successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating tutor status:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating tutor status' },
      { status: 500 }
    );
  }
}