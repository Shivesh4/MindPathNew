import { sendEmailVerification, sendTutorApprovalNotification, sendStudentWelcomeEmail, sendPasswordResetEmail } from '../email.js';

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    
    // Test email verification
    console.log('\n1. Testing email verification...');
    const verificationResult = await sendEmailVerification('test@example.com', 'user123');
    console.log('Email verification result:', verificationResult ? 'SUCCESS' : 'FAILED');
    
    // Test tutor approval notification (approved)
    console.log('\n2. Testing tutor approval notification (approved)...');
    const approvalResult = await sendTutorApprovalNotification('tutor@example.com', true);
    console.log('Tutor approval notification result:', approvalResult ? 'SUCCESS' : 'FAILED');
    
    // Test tutor approval notification (rejected)
    console.log('\n3. Testing tutor approval notification (rejected)...');
    const rejectionResult = await sendTutorApprovalNotification('tutor@example.com', false);
    console.log('Tutor rejection notification result:', rejectionResult ? 'SUCCESS' : 'FAILED');
    
    // Test student welcome email
    console.log('\n4. Testing student welcome email...');
    const welcomeResult = await sendStudentWelcomeEmail('student@example.com');
    console.log('Student welcome email result:', welcomeResult ? 'SUCCESS' : 'FAILED');
    
    // Test password reset email
    console.log('\n5. Testing password reset email...');
    const resetResult = await sendPasswordResetEmail('user@example.com', 'resetToken123');
    console.log('Password reset email result:', resetResult ? 'SUCCESS' : 'FAILED');
    
    console.log('\nEmail functionality test completed!');
  } catch (error) {
    console.error('Error during email test:', error);
  }
}

testEmail();