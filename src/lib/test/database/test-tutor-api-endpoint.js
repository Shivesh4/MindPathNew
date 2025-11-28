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

async function testTutorAPIEndpoint() {
  try {
    console.log('Testing tutor API endpoint...\n');
    
    // Generate a test token
    const token = generateTestToken();
    console.log('Generated test JWT token:');
    console.log(`${token.substring(0, 50)}...\n`);
    
    // Show how to use the token with curl
    console.log('To test the API endpoint manually, use this curl command:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:9002/api/tutors`);
    console.log('');
    
    // Show how to use the token with curl for a specific limit
    console.log('To test with a limit:');
    console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:9002/api/tutors?limit=6"`);
    console.log('');
    
    console.log('✅ Tutor API endpoint test setup completed successfully!');
    console.log('\nNote: To actually test the API endpoint, you need to run the Next.js server and use the curl commands above.');
    
  } catch (error) {
    console.error('❌ Error testing tutor API endpoint:', error);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTutorAPIEndpoint();