import { NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth/jwt';

/**
 * Middleware to protect API routes with JWT authentication
 * @param {Request} request - Next.js request object
 * @returns {NextResponse|null} NextResponse if authentication fails, null if successful
 */
export async function authenticateRequest(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Fetch user data from database
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Add user data to request for use in route handlers
    request.user = user;
    request.userId = user.id;
    
    return null; // Authentication successful
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}