import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTutorRecord() {
  try {
    const userId = '3d7e635d-8b10-473c-9844-d95b9b0a0aa8';
    const oldTutorId = '8dc9d74a-5071-49a6-9298-95e7aff8f036';
    
    console.log(`Fixing tutor record for user ID: ${userId}`);
    
    // First, delete all sessions associated with the old tutor ID
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        tutorId: oldTutorId
      }
    });
    
    console.log(`Deleted ${deletedSessions.count} sessions`);
    
    // Delete the old tutor record
    const deletedTutor = await prisma.tutor.delete({
      where: {
        id: oldTutorId
      }
    });
    
    console.log('Deleted old tutor record');
    
    // Create a new tutor record with the correct ID pattern
    const newTutor = await prisma.tutor.create({
      data: {
        id: userId, // Same as user ID
        userId: userId,
        rating: 0,
        reviews: 0,
        experience: 0,
        subjects: ["ML", "CS", "Ai"],
        bio: "Amazing Tutor in Computer Science and Machine Learning"
      }
    });
    
    console.log('Created new tutor record with correct ID pattern:');
    console.log(JSON.stringify(newTutor, null, 2));
    
  } catch (error) {
    console.error('Error fixing tutor record:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTutorRecord();