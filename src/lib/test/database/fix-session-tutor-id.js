import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSessionTutorId() {
  try {
    const userId = '3d7e635d-8b10-473c-9844-d95b9b0a0aa8'; // Enox Eldger user ID
    const oldTutorId = '8dc9d74a-5071-49a6-9298-95e7aff8f036'; // Old tutor ID
    const newTutorId = userId; // New tutor ID (same as user ID)
    
    console.log(`Updating session tutor ID from ${oldTutorId} to ${newTutorId}`);
    
    // Update the session to use the correct tutor ID
    const updatedSession = await prisma.session.update({
      where: {
        tutorId: oldTutorId,
        title: 'Introduction to Computer Science'
      },
      data: {
        tutorId: newTutorId
      }
    });
    
    console.log('Session updated successfully:');
    console.log(JSON.stringify(updatedSession, null, 2));
    
  } catch (error) {
    console.error('Error updating session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSessionTutorId();