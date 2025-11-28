import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Function to generate a test JWT token for a tutor
function generateTestToken() {
  // Use the existing tutor user data
  const payload = {
    id: '0f3518e0-17af-4552-b2bd-51bf89ddb7bb', // Enox Eldger's ID
    name: 'Enox Eldger',
    email: 'suhithghanathay@gmail.com',
    role: 'TUTOR'
  };
  
  // Use the same secret as in the application
  const token = jwt.sign(payload, 'mindpath_jwt_secret_key_2024', { expiresIn: '24h' });
  return token;
}

async function testTutorAPIDirect() {
  try {
    console.log('Testing tutor API endpoint directly...\n');
    
    // Generate a test token
    const token = generateTestToken();
    console.log('Generated test JWT token:');
    console.log(`${token.substring(0, 50)}...\n`);
    
    // Since we can't directly call the Next.js API route from here,
    // let's show what the expected response structure should look like
    // by querying the database directly in the same way the API would
    
    console.log('Simulating API response by querying database directly:\n');
    
    // This mimics what the /api/tutors endpoint does
    const limit = 6;
    const page = 1;
    const skip = (page - 1) * limit;
    const now = new Date();
    
    const [totalCount, tutors] = await Promise.all([
      prisma.tutor.count({
        where: {
          user: {
            isApproved: true
          }
        }
      }),
      prisma.tutor.findMany({
        where: {
          user: {
            isApproved: true
          }
        },
        orderBy: [
          { rating: 'desc' },
          { reviews: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarId: true,
              bio: true,
              location: true
            }
          },
          sessions: {
            where: {
              status: 'UPCOMING',
              dateTime: {
                gte: now
              }
            },
            select: {
              id: true,
              dateTime: true,
              status: true
            },
            orderBy: {
              dateTime: 'asc'
            }
          }
        }
      })
    ]);
    
    // Transform the data to match the API response
    const tutorsPayload = tutors.map((tutor) => {
      const nextSession = tutor.sessions[0]?.dateTime ?? null;
      return {
        id: tutor.id,
        userId: tutor.userId,
        name: tutor.user?.name ?? '',
        avatarId: tutor.user?.avatarId ?? null,
        rating: tutor.rating,
        reviews: tutor.reviews,
        experience: tutor.experience,
        subjects: tutor.subjects,
        bio: tutor.bio ?? tutor.user?.bio ?? '',
        location: tutor.user?.location ?? null,
        availability: tutor.availability ?? null,
        upcomingSessionsCount: tutor.sessions.length,
        nextAvailableSession: nextSession ? nextSession.toISOString() : null
      };
    });
    
    const apiResponse = {
      tutors: tutorsPayload,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
    
    console.log('Expected API response:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ Tutor API direct test completed successfully!');
    console.log('\nThis shows what the /api/tutors endpoint should return.');
    console.log('To actually test the live API endpoint, use the curl commands from the previous test.');
    
  } catch (error) {
    console.error('❌ Error testing tutor API directly:', error);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTutorAPIDirect();