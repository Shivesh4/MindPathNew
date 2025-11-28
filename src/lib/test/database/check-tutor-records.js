import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTutorRecords() {
  try {
    console.log('Checking tutor records in the database...');
    
    // Check all tutors
    const tutors = await prisma.tutor.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`Found ${tutors.length} tutor records:`);
    tutors.forEach(tutor => {
      console.log(`- ${tutor.user?.name || 'Unknown'} (${tutor.id})`);
      console.log(`  User ID: ${tutor.userId}`);
    });
    
  } catch (error) {
    console.error('Error checking tutor records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTutorRecords();