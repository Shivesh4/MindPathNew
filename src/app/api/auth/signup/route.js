import { createStudentUser, createTutorUser } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password, role, bio, subjects } = await request.json();
    
    let user;
    
    if (role === 'student') {
      user = await createStudentUser(name, email, password);
    } else if (role === 'tutor') {
      user = await createTutorUser(name, email, password, bio, subjects);
    } else {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: role === 'student' 
        ? 'Student account created successfully. Please check your email for verification.' 
        : 'Tutor account created successfully. Your account is pending admin approval.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during signup' },
      { status: 500 }
    );
  }
}