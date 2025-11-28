async function testEmailVerification() {
  try {
    console.log('Testing email verification API...');
    
    // Use the userId from the previously created student account
    const userId = '2f4c2659-c633-47d6-9112-b62cdb1f38d5';
    
    const response = await fetch('http://localhost:9002/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const data = await response.json();
    
    console.log('Verification response status:', response.status);
    console.log('Verification response data:', data);
    
    if (response.ok) {
      console.log('Email verification successful!');
    } else {
      console.log('Email verification failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing email verification:', error);
  }
}

testEmailVerification();