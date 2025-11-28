import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserFetch() {
  try {
    const userId = '8dc9d74a-5071-49a6-9298-95e7aff8f036'; // Enox Eldger
    
    console.log(`Testing fetch for user ID: ${userId}`);
    
    // Test the exact query used in getUserById
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarId: true,
        phone: true,
        location: true,
        bio: true,
        academicLevel: true,
        institution: true,
        major: true,
        year: true,
        gpa: true,
        isApproved: true,
        isEmailVerified: true,
        createdAt: true,
        lastActive: true,
        student: true,
        tutor: true
      }
    });
    
    if (user) {
      console.log('User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User not found with this ID');
      
      // Let's check all users to see what IDs exist
      console.log('\nAll users in database:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - ${u.role} - ${u.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing user fetch:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserFetch();