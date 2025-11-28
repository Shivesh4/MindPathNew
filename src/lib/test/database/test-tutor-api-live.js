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

async function testTutorAPILive() {
  try {
    console.log('Testing live tutor API endpoint...\n');
    
    // Generate a test token
    const token = generateTestToken();
    console.log('Generated test JWT token:');
    console.log(`${token.substring(0, 50)}...\n`);
    
    // Test the API endpoint directly
    console.log('Calling API endpoint: http://localhost:9002/api/tutors?limit=6\n');
    
    const response = await fetch('http://localhost:9002/api/tutors?limit=6', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\nAPI Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log(`\nFound ${data.tutors?.length || 0} tutors`);
      console.log(`Total tutors in database: ${data.pagination?.total || 0}`);
      console.log(`Total pages: ${data.pagination?.totalPages || 0}`);
      
      if (data.tutors && data.tutors.length > 0) {
        console.log('\nFirst tutor details:');
        const tutor = data.tutors[0];
        console.log(`  Name: ${tutor.name}`);
        console.log(`  ID: ${tutor.id}`);
        console.log(`  Rating: ${tutor.rating}`);
        console.log(`  Reviews: ${tutor.reviews}`);
        console.log(`  Subjects: ${tutor.subjects?.join(', ')}`);
        console.log(`  Upcoming sessions: ${tutor.upcomingSessionsCount}`);
      }
    } else {
      console.log(`Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText}`);
    }
    
    console.log('\n✅ Live tutor API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing live tutor API:', error);
    console.error('Error message:', error.message);
    console.log('\nNote: Make sure the Next.js server is running on port 9002');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTutorAPILive();