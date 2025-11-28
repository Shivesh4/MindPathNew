import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTutors() {
  try {
    console.log('Checking for tutors in the database...');
    
    // Check for users with tutor role
    const tutorUsers = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      include: {
        tutor: true
      }
    });
    
    console.log(`Found ${tutorUsers.length} tutor users:`);
    tutorUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Approved: ${user.isApproved}`);
      if (user.tutor) {
        console.log(`  Tutor ID: ${user.tutor.id}`);
        console.log(`  Subjects: ${user.tutor.subjects.join(', ')}`);
      } else {
        console.log('  No tutor record found!');
      }
    });
    
    // Check for all tutors
    const tutors = await prisma.tutor.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`\nFound ${tutors.length} tutor records:`);
    tutors.forEach(tutor => {
      console.log(`- ${tutor.user?.name || 'Unknown'} (${tutor.id})`);
    });
    
  } catch (error) {
    console.error('Error checking tutors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTutors();