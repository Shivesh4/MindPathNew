import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailVerification, sendTutorApprovalNotification, sendStudentWelcomeEmail } from '../email.js';

// Create admin user
export async function createAdminUser() {
  const adminEmail = 'admin@mindmap.com';
  const adminPassword = 'M@hesh8900';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existingAdmin) {
    console.log('Admin user already exists');
    return existingAdmin;
  }
  
  // Generate user ID
  const userId = uuidv4();
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      id: userId,
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      createdAt: new Date(),
      lastActive: new Date()
    }
  });
  
  console.log('Admin user created successfully');
  return adminUser;
}

// Validate user credentials
export async function validateUserCredentials(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user || !user.password) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }
  
  // For tutors, check if they are approved
  if (user.role === 'TUTOR' && !user.isApproved) {
    throw new Error('Tutor account is pending approval by admin');
  }
  
  // For students, check if email is verified
  if (user.role === 'STUDENT' && !user.isEmailVerified) {
    throw new Error('Student email is not verified');
  }
  
  // Update last active timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActive: new Date() }
  });
  
  return user;
}

// Create student user with email verification pending
export async function createStudentUser(name, email, password) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Generate user ID
  const userId = uuidv4();
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user with student role and verification pending
  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'STUDENT',
      isEmailVerified: false,
      isApproved: true, // Students don't need admin approval
      createdAt: new Date(),
      lastActive: new Date(),
      student: {
        create: {
          id: userId, // Use the same ID as the user
          enrolledSubjects: [],
          studyGoals: []
        }
      }
    }
  });
  
  // Send email verification
  await sendEmailVerification(user.email, user.id);
  
  return user;
}

// Create tutor user with approval pending
export async function createTutorUser(name, email, password, bio, subjects) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Generate user ID
  const userId = uuidv4();
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user with tutor role and approval pending
  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'TUTOR',
      isEmailVerified: true, // Assuming tutors are verified during signup
      isApproved: false, // Tutors need admin approval
      createdAt: new Date(),
      lastActive: new Date(),
      tutor: {
        create: {
          id: userId, // Use the same ID as the user
          rating: 0,
          reviews: 0,
          experience: 0,
          subjects: subjects || [],
          bio: bio || ''
        }
      }
    }
  });
  
  return user;
}

// Verify email for student
export async function verifyStudentEmail(userId) {
  // First check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  // Check if user is already verified
  if (existingUser.isEmailVerified) {
    return existingUser; // Already verified, no need to update
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true }
  });
  
  // Send welcome email
  await sendStudentWelcomeEmail(user.email);
  
  return user;
}

// Approve tutor by admin
export async function approveTutor(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true }
  });
  
  // Notify tutor of approval
  await sendTutorApprovalNotification(user.email, true);
  
  return user;
}

// Reject tutor by admin
export async function rejectTutor(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isApproved: false }
  });
  
  // Notify tutor of rejection
  await sendTutorApprovalNotification(user.email, false);
  
  return user;
}

// Get pending tutor approvals
export async function getPendingTutorApprovals() {
  return await prisma.user.findMany({
    where: {
      role: 'TUTOR',
      isApproved: false
    },
    include: {
      tutor: true
    }
  });
}

// Get all tutors (approved and pending)
export async function getAllTutors() {
  return await prisma.user.findMany({
    where: {
      role: 'TUTOR'
    },
    include: {
      tutor: true
    }
  });
}

// Resend email verification for student
export async function resendEmailVerification(email) {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user is a student
  if (user.role !== 'STUDENT') {
    throw new Error('Email verification is only for students');
  }
  
  // Check if email is already verified
  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }
  
  // Send email verification
  await sendEmailVerification(user.email, user.id);
  
  return user;
}

// Generate password reset token
export async function generatePasswordResetToken(email) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate reset token (in a real app, you'd store this in the database)
  const resetToken = `${user.id}-${Date.now()}`;
  
  // In a real application, you would:
  // 1. Store the reset token in the database with an expiration time
  // 2. Send the email with the reset token
  
  return resetToken;
}

// Reset user password
export async function resetUserPassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
}