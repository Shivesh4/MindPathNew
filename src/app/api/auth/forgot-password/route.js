import { generatePasswordResetToken } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    // Generate reset token
    const resetToken = await generatePasswordResetToken(email);
    
    // In a real application, you would send an email with the reset token
    // For now, we'll just return a success message
    
    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Don't reveal if the email exists or not for security
    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  }
}