import { validateUserCredentials, createStudentUser, createTutorUser, getPendingTutorApprovals } from './auth.js';

async function testAuth() {
  try {
    console.log('Testing authentication system...');
    
    // Test admin login
    console.log('\n1. Testing admin login...');
    const adminUser = await validateUserCredentials('admin@mindmap.com', 'M@hesh8900');
    console.log('Admin login result:', adminUser ? 'SUCCESS' : 'FAILED');
    
    // Test student signup
    console.log('\n2. Testing student signup...');
    try {
      const studentUser = await createStudentUser('Test Student', 'student@test.com', 'Test@Pass123');
      console.log('Student signup result:', studentUser ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('Student signup error:', error.message);
    }
    
    // Test tutor signup
    console.log('\n3. Testing tutor signup...');
    try {
      const tutorUser = await createTutorUser('Test Tutor', 'tutor@test.com', 'Test@Pass123', 'Experienced Math Tutor', ['Math', 'Physics']);
      console.log('Tutor signup result:', tutorUser ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('Tutor signup error:', error.message);
    }
    
    // Test pending tutor approvals
    console.log('\n4. Testing pending tutor approvals...');
    const pendingTutors = await getPendingTutorApprovals();
    console.log('Pending tutors count:', pendingTutors.length);
    
    console.log('\nAuthentication system test completed!');
  } catch (error) {
    console.error('Error during authentication test:', error);
  }
}

testAuth();