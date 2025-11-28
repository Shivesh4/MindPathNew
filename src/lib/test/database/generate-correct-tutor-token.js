import jwt from 'jsonwebtoken';

// Use the correct ID for Enox Eldger
const tutorUserId = '3d7e635d-8b10-473c-9844-d95b9b0a0aa8';

const payload = {
  id: tutorUserId,
  name: 'Enox Eldger',
  email: 'suhithghanathay69@gmail.com',
  role: 'TUTOR'
};

const token = jwt.sign(payload, 'mindpath_jwt_secret_key_2024', { expiresIn: '24h' });

console.log('Generated JWT token for tutor:');
console.log(token);

console.log('\nTo test the API, use this curl command:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:9002/api/sessions`);