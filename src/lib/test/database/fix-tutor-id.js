import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTutorId() {
  try {
    const userId = '3d7e635d-8b10-473c-9844-d95b9b0a0aa8'; // Enox Eldger user ID
    const oldTutorId = '8dc9d74a-5071-49a6-9298-95e7aff8f036'; // Old tutor ID
    
    console.log(`Updating tutor ID from ${oldTutorId} to ${userId}`);
    
    // First, we need to update all sessions that reference the old tutor ID
    const updatedSessions = await prisma.session.updateMany({
      where: {
        tutorId: oldTutorId
      },
      data: {
        tutorId: userId
      }
    });
    
    console.log(`Updated ${updatedSessions.count} sessions`);
    
    // Now update the tutor record itself
    const updatedTutor = await prisma.tutor.update({
      where: {
        id: oldTutorId
      },
      data: {
        id: userId,
        userId: userId
      }
    });
    
    console.log('Tutor updated successfully:');
    console.log(JSON.stringify(updatedTutor, null, 2));
    
  } catch (error) {
    console.error('Error updating tutor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTutorId();