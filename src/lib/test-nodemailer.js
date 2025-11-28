import nodemailer from 'nodemailer';

console.log('Nodemailer imported successfully');

// Check if createTransport method exists
if (typeof nodemailer.createTransport === 'function') {
  console.log('createTransport method is available');
} else {
  console.log('createTransport method is NOT available');
  console.log('Available properties:', Object.keys(nodemailer));
}

// Test creating a transporter
try {
  const transporter = nodemailer.createTransport({
    host: 'mail.mxs7500.uta.cloud',
    port: 465,
    secure: true,
    auth: {
      user: 'no-reply@mxs7500.uta.cloud',
      pass: 'test-password',
    },
  });
  console.log('Transporter created successfully');
  
  // Check if sendMail method exists
  if (typeof transporter.sendMail === 'function') {
    console.log('sendMail method is available');
  } else {
    console.log('sendMail method is NOT available');
    console.log('Available transporter properties:', Object.keys(transporter));
  }
} catch (error) {
  console.error('Error creating transporter:', error);
}