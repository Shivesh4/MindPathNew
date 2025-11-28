import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTutorAPI() {
  try {
    console.log('Testing tutor API and retrieving all tutors...\n');
    
    // Test 1: Get all tutors from the database
    console.log('1. Retrieving all tutors from database:');
    const tutors = await prisma.tutor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isApproved: true,
            createdAt: true
          }
        },
        sessions: {
          where: {
            status: 'UPCOMING'
          },
          select: {
            id: true,
            title: true,
            dateTime: true
          }
        }
      }
    });
    
    console.log(`Found ${tutors.length} tutors in the database:`);
    tutors.forEach((tutor, index) => {
      console.log(`\n--- Tutor ${index + 1} ---`);
      console.log(`ID: ${tutor.id}`);
      console.log(`Name: ${tutor.user?.name || 'N/A'}`);
      console.log(`Email: ${tutor.user?.email || 'N/A'}`);
      console.log(`Role: ${tutor.user?.role || 'N/A'}`);
      console.log(`Approved: ${tutor.user?.isApproved ? 'Yes' : 'No'}`);
      console.log(`Rating: ${tutor.rating}`);
      console.log(`Reviews: ${tutor.reviews}`);
      console.log(`Experience: ${tutor.experience} years`);
      console.log(`Subjects: ${tutor.subjects.join(', ')}`);
      console.log(`Upcoming Sessions: ${tutor.sessions.length}`);
      tutor.sessions.forEach(session => {
        console.log(`  - ${session.title} on ${session.dateTime}`);
      });
    });
    
    // Test 2: Count total tutors
    console.log('\n\n2. Tutor counts by approval status:');
    const totalTutors = await prisma.tutor.count();
    const approvedTutors = await prisma.tutor.count({
      where: {
        user: {
          isApproved: true
        }
      }
    });
    const pendingTutors = await prisma.tutor.count({
      where: {
        user: {
          isApproved: false
        }
      }
    });
    
    console.log(`Total tutors: ${totalTutors}`);
    console.log(`Approved tutors: ${approvedTutors}`);
    console.log(`Pending approval: ${pendingTutors}`);
    
    // Test 3: Check tutor with highest rating
    console.log('\n\n3. Top rated tutor:');
    const topTutor = await prisma.tutor.findFirst({
      where: {
        user: {
          isApproved: true
        }
      },
      orderBy: {
        rating: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (topTutor) {
      console.log(`Name: ${topTutor.user?.name || 'N/A'}`);
      console.log(`Rating: ${topTutor.rating}`);
      console.log(`Reviews: ${topTutor.reviews}`);
    } else {
      console.log('No approved tutors found');
    }
    
    console.log('\n✅ Tutor API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing tutor API:', error);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTutorAPI();