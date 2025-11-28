import { NextResponse } from 'next/server';
import { isAuthenticated, hasRole } from '@/lib/session';

// Middleware to protect routes based on authentication status
export function withAuth(handler) {
  return async (request) => {
    // In a real application, you would check the session/cookie/JWT
    // For now, we'll simulate authentication check
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return handler(request);
  };
}

// Middleware to protect admin-only routes
export function withAdminAuth(handler) {
  return async (request) => {
    // In a real application, you would check the session/cookie/JWT
    // For now, we'll simulate admin check
    const authenticated = isAuthenticated();
    const isAdminUser = hasRole('ADMIN');
    
    if (!authenticated || !isAdminUser) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return handler(request);
  };
}

// Middleware to protect student-only routes
export function withStudentAuth(handler) {
  return async (request) => {
    // In a real application, you would check the session/cookie/JWT
    // For now, we'll simulate student check
    const authenticated = isAuthenticated();
    const isStudentUser = hasRole('STUDENT');
    
    if (!authenticated || !isStudentUser) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return handler(request);
  };
}

// Middleware to protect tutor-only routes
export function withTutorAuth(handler) {
  return async (request) => {
    // In a real application, you would check the session/cookie/JWT
    // For now, we'll simulate tutor check
    const authenticated = isAuthenticated();
    const isTutorUser = hasRole('TUTOR');
    
    if (!authenticated || !isTutorUser) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return handler(request);
  };
}