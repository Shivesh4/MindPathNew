// seed.js
// Script to seed the database with initial data including admin user and sample data

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createAdminUser() {
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
  console.log('Email:', adminUser.email);
  console.log('Password:', adminPassword);
  
  return adminUser;
}

async function createSampleUsers() {
  try {
    // Create sample student user
    const studentEmail = 'student@example.com';
    const studentPassword = 'Student123!';
    
    const existingStudent = await prisma.user.findUnique({
      where: { email: studentEmail }
    });
    
    if (!existingStudent) {
      const hashedPassword = await bcrypt.hash(studentPassword, 10);
      
      // Generate user ID
      const userId = uuidv4();
      
      const studentUser = await prisma.user.create({
        data: {
          id: userId,
          name: 'Sample Student',
          email: studentEmail,
          password: hashedPassword,
          role: 'STUDENT',
          isEmailVerified: true,
          isApproved: true,
          createdAt: new Date(),
          lastActive: new Date(),
          student: {
            create: {
              id: userId, // Use the same ID as the user
              enrolledSubjects: ['Mathematics', 'Physics', 'Chemistry'],
              studyGoals: ['Improve grades', 'Prepare for exams']
            }
          }
        }
      });
      
      console.log('Sample student user created successfully');
    }
    
    // Create sample tutor user
    const tutorEmail = 'tutor@example.com';
    const tutorPassword = 'Tutor123!';
    
    const existingTutor = await prisma.user.findUnique({
      where: { email: tutorEmail }
    });
    
    if (!existingTutor) {
      const hashedPassword = await bcrypt.hash(tutorPassword, 10);
      
      // Generate a single ID for both user and tutor
      const userId = uuidv4();
      
      const tutorUser = await prisma.user.create({
        data: {
          id: userId,
          name: 'Sample Tutor',
          email: tutorEmail,
          password: hashedPassword,
          role: 'TUTOR',
          isEmailVerified: true,
          isApproved: true,
          createdAt: new Date(),
          lastActive: new Date(),
          tutor: {
            create: {
              id: userId, // Use the same ID as the user
              rating: 4.8,
              reviews: 15,
              experience: 5,
              subjects: ['Mathematics', 'Physics'],
              bio: 'Experienced mathematics and physics tutor with 5 years of teaching experience.'
            }
          }
        }
      });
      
      console.log('Sample tutor user created successfully');
    }
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
}

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Create admin user
    await createAdminUser();
    
    // Create sample users
    await createSampleUsers();
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed();