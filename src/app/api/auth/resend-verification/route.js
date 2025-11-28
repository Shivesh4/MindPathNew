import { resendEmailVerification } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    // Resend the verification email
    await resendEmailVerification(email);
    
    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while sending the verification email' },
      { status: 400 }
    );
  }
}