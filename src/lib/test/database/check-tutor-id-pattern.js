import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTutorIdPattern() {
  try {
    console.log('Checking tutor ID pattern...');
    
    // Check all tutors
    const tutors = await prisma.tutor.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`Found ${tutors.length} tutors:`);
    tutors.forEach(tutor => {
      const userId = tutor.userId;
      const tutorId = tutor.id;
      const match = userId === tutorId ? '✓ MATCH' : '✗ MISMATCH';
      
      console.log(`- ${tutor.user?.name || 'Unknown'}`);
      console.log(`  User ID: ${userId}`);
      console.log(`  Tutor ID: ${tutorId}`);
      console.log(`  ${match}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking tutor ID pattern:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTutorIdPattern();