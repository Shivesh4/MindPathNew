// Test the authentication API
async function testAuthAPI() {
  try {
    console.log('Testing authentication API...');
    
    // Test login endpoint
    console.log('\n1. Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@mindmap.com',
        password: 'M@hesh8900',
      }),
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response data:', loginData);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAuthAPI();