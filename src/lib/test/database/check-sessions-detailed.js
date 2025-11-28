import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSessionsDetailed() {
  try {
    console.log('Checking sessions in detail...');
    
    // Check all sessions
    const sessions = await prisma.session.findMany({
      include: {
        tutor: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach(session => {
      console.log(`- ${session.title} (${session.id})`);
      console.log(`  Tutor: ${session.tutor?.user?.name || 'Unknown'} (${session.tutorId})`);
      console.log(`  Date: ${session.dateTime}`);
      console.log(`  Status: ${session.status}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessionsDetailed();