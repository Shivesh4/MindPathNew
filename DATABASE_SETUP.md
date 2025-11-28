# Database Setup with Prisma ORM and Supabase Postgres

This document outlines the steps taken to set up the database for the MindPath AI Study Planner application using Prisma ORM and Supabase Postgres.

## Prerequisites

- Node.js v18 or later
- npm package manager
- Supabase account with a Postgres database

## Steps Completed

### 1. Installed Prisma Dependencies

```bash
npm install prisma --save-dev
npm install @prisma/client
```

### 2. Initialized Prisma

```bash
npx prisma init
```

This created:
- `prisma/schema.prisma` - The Prisma schema file
- `.env` - Environment variables (DATABASE_URL was already configured for Supabase)

### 3. Created Database Schema

Defined the following models in `prisma/schema.prisma`:
- User (with role-based differentiation)
- Student (extended profile)
- Tutor (extended profile)
- StudyPlan (personalized learning roadmap)
- WeeklyPlan (weekly breakdown of study plan)
- Task (individual learning activities)
- SubTask (granular breakdown of tasks)
- Session (tutoring sessions)
- SessionAttendee (mapping between sessions and students)
- Message (communication between users)
- Notification (system alerts)
- Review (feedback system)

### 4. Generated Prisma Client

```bash
npx prisma generate
```

### 5. Created Database Migrations

```bash
npx prisma migrate dev --name init
```

This created the database tables in Supabase Postgres based on our schema.

### 6. Created Database Utility

Created `src/lib/db.js` for easy access to the Prisma client throughout the application.

### 7. Tested Database Connection

Created and ran test scripts to verify the database setup works correctly.

## Database Models

The schema includes 13 models with appropriate relations:
- User roles (Student, Tutor, Admin)
- Study plan hierarchy (StudyPlan → WeeklyPlan → Task → SubTask)
- Session management with attendee tracking
- Messaging system
- Notification system
- Review system

## Usage

To use the database in your application:

1. Import the Prisma client:
```javascript
import prisma from '../lib/db.js'
```

2. Use it to query the database:
```javascript
const users = await prisma.user.findMany()
const tutors = await prisma.tutor.findMany({
  include: {
    user: true,
    sessions: true
  }
})
```

## Next Steps

1. Implement data access functions in your application using the Prisma client
2. Add seed data for initial application setup
3. Configure Prisma Studio for database browsing during development:
   ```bash
   npx prisma studio
   ```

The database is now ready for use with all tables properly structured and related according to the application requirements.