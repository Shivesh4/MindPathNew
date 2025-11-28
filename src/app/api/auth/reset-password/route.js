import { resetUserPassword } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, newPassword } = await request.json();
    
    // Reset the user's password
    await resetUserPassword(userId, newPassword);
    
    return NextResponse.json({
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting the password' },
      { status: 500 }
    );
  }
}