import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateUsers() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    
    // Update each user with a default password
    for (const user of users) {
      // Create a default password based on their role
      let defaultPassword;
      if (user.role === 'ADMIN') {
        defaultPassword = 'Admin@Passw0rd';
      } else if (user.role === 'STUDENT') {
        defaultPassword = 'Student@Passw0rd';
      } else if (user.role === 'TUTOR') {
        defaultPassword = 'Tutor@Passw0rd';
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log(`Updated user ${user.email} with default password`);
    }
    
    console.log('All users updated successfully');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsers();