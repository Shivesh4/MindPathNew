import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const userId = 'd39c2510-d8be-465a-bc86-eaca9a2df38b';
    console.log(`Checking user with ID: ${userId}`);
    
    // Check for the specific user
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        tutor: true
      }
    });
    
    if (user) {
      console.log(`User found: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      console.log(`Approved: ${user.isApproved}`);
      if (user.tutor) {
        console.log(`Tutor ID: ${user.tutor.id}`);
        console.log(`Subjects: ${user.tutor.subjects.join(', ')}`);
      } else {
        console.log('No tutor record found for this user');
      }
    } else {
      console.log('User not found in database');
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();