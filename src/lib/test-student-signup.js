import { createStudentUser } from './auth.js';

async function testStudentSignup() {
  try {
    console.log('Creating test student account...');
    
    const student = await createStudentUser(
      'Test Student',
      'teststudent@example.com',
      'TestPass123!'
    );
    
    console.log('Student account created:', student);
    console.log('Please check the email for verification link');
  } catch (error) {
    console.error('Error creating student account:', error);
  }
}

testStudentSignup();