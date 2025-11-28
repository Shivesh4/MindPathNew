import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTutorData() {
  try {
    const oldTutorId = '8dc9d74a-5071-49a6-9298-95e7aff8f036';
    
    console.log(`Getting data for tutor ID: ${oldTutorId}`);
    
    // Get the tutor data
    const tutor = await prisma.tutor.findUnique({
      where: {
        id: oldTutorId
      },
      include: {
        user: true
      }
    });
    
    if (tutor) {
      console.log('Tutor data:');
      console.log(JSON.stringify(tutor, null, 2));
    } else {
      console.log('Tutor not found');
    }
    
  } catch (error) {
    console.error('Error getting tutor data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTutorData();