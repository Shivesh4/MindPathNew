import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

// Secret key for JWT signing (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'mindpath_jwt_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, name, email, role
 * @returns {string} JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token and return the decoded user data
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded user data or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get user data from database by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User data or null if not found
 */
export async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarId: true,
        phone: true,
        location: true,
        bio: true,
        academicLevel: true,
        institution: true,
        major: true,
        year: true,
        gpa: true,
        isApproved: true,
        isEmailVerified: true,
        createdAt: true,
        lastActive: true,
        student: true,
        tutor: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get user data from database by email
 * @param {string} email - User email
 * @returns {Object|null} User data or null if not found
 */
export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarId: true,
        phone: true,
        location: true,
        bio: true,
        academicLevel: true,
        institution: true,
        major: true,
        year: true,
        gpa: true,
        isApproved: true,
        isEmailVerified: true,
        createdAt: true,
        lastActive: true,
        student: true,
        tutor: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}