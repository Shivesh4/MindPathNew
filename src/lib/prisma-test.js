import prisma from '../db.js'

async function main() {
  // Test creating a user
  const user = await prisma.user.create({
    data: {
      name: 'Test User 2',
      email: 'test2@example.com',
      role: 'TUTOR'
    }
  })
  console.log('Created user:', user)

  // Test finding all users
  const users = await prisma.user.findMany()
  console.log('All users:', users)

  // Test finding users by role
  const tutors = await prisma.user.findMany({
    where: {
      role: 'TUTOR'
    }
  })
  console.log('All tutors:', tutors)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })