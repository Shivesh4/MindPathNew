import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestSession() {
  try {
    const tutorId = '8dc9d74a-5071-49a6-9298-95e7aff8f036'; // Enox Eldger tutor record ID
    
    console.log(`Creating test session for tutor ID: ${tutorId}`);
    
    // Create a test session
    const session = await prisma.session.create({
      data: {
        tutorId: tutorId,
        title: 'Introduction to Computer Science',
        sessionType: 'Tutorial',
        description: 'Basic concepts of programming and algorithms',
        dateTime: new Date('2025-11-15T10:00:00'),
        duration: 60,
        mode: 'ONLINE',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        availableSeats: 10,
        status: 'UPCOMING'
      }
    });
    
    console.log('Test session created successfully:');
    console.log(JSON.stringify(session, null, 2));
    
  } catch (error) {
    console.error('Error creating test session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession();