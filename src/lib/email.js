import nodemailer from 'nodemailer';

// Create transporter using the email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_OUTGOING_SERVER || 'mail.mxs7500.uta.cloud',
  port: process.env.EMAIL_SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME || 'no-reply@mxs7500.uta.cloud',
    pass: process.env.EMAIL_PASSWORD || 'Use the email account\'s password.',
  },
});

// Function to send email verification to students
export async function sendEmailVerification(email, userId) {
  try {
    // In a real application, you would generate a secure token and store it
    // For now, we'll use a simple approach
    const verificationToken = `${userId}-${Date.now()}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'no-reply@mxs7500.uta.cloud',
      to: email,
      subject: 'MindPath - Please verify your email address',
      html: `
        <h2>Welcome to MindPath!</h2>
        <p>Thank you for signing up as a student. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${process.env.BASE_URL || 'http://localhost:9002'}/verify-email?userId=${userId}&email=${encodeURIComponent(email)}" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Function to send tutor approval notification
export async function sendTutorApprovalNotification(email, approved) {
  try {
    const subject = approved 
      ? 'MindPath - Your tutor application has been approved!' 
      : 'MindPath - Update on your tutor application';
      
    const htmlContent = approved
      ? `
        <h2>Congratulations!</h2>
        <p>Your tutor application has been approved. You can now log in to your tutor dashboard.</p>
        <p>
          <a href="${process.env.BASE_URL || 'http://localhost:9002'}/login" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Log In
          </a>
        </p>
      `
      : `
        <h2>Application Update</h2>
        <p>Thank you for your interest in becoming a tutor on MindPath. After reviewing your application, 
           we regret to inform you that it has not been approved at this time.</p>
        <p>If you have any questions, please contact our support team.</p>
      `;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'no-reply@mxs7500.uta.cloud',
      to: email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Tutor approval notification sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending tutor approval notification:', error);
    return false;
  }
}

// Function to send student welcome email
export async function sendStudentWelcomeEmail(email) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'no-reply@mxs7500.uta.cloud',
      to: email,
      subject: 'Welcome to MindPath - Your Learning Journey Starts Here!',
      html: `
        <h2>Welcome to MindPath!</h2>
        <p>Congratulations! Your email has been verified and your account is now active.</p>
        <p>You can now start exploring personalized study plans, connect with expert tutors, and achieve your learning goals.</p>
        <p>
          <a href="${process.env.BASE_URL || 'http://localhost:9002'}/login" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Get Started
          </a>
        </p>
        <p>Happy learning!</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Student welcome email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending student welcome email:', error);
    return false;
  }
}

// Function to send password reset email
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'no-reply@mxs7500.uta.cloud',
      to: email,
      subject: 'MindPath - Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${process.env.BASE_URL || 'http://localhost:9002'}/reset-password?userId=${userId}" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}