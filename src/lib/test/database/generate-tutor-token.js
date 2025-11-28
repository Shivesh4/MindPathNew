import jwt from 'jsonwebtoken';

// Use the ID of one of our tutor users
const tutorUserId = '8dc9d74a-5071-49a6-9298-95e7aff8f036'; // Enox Eldger

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