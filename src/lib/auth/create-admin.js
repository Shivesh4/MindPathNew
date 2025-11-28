import { createAdminUser } from './auth.js';

async function createAdmin() {
  try {
    const adminUser = await createAdminUser();
    console.log('Admin user created:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();