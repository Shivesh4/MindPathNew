import { verifyStudentEmail } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    // Verify the student's email
    const user = await verifyStudentEmail(userId);
    
    return NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Handle specific error cases
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found. The verification link may be invalid or expired.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while verifying the email: ' + error.message },
      { status: 500 }
    );
  }
}