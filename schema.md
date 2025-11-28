# MindPath AI Study Planner - Application Schema

This document outlines the data schema for the MindPath AI Study Planner application, which connects students and tutors with AI-powered educational tools.

## Core Entities

### User Roles
The application supports three primary user roles:
1. **Student** - Learners who use study plans and connect with tutors
2. **Tutor** - Educators who provide sessions and guidance
3. **Admin** - Platform administrators who manage users and content

### 1. User
Represents any user of the platform regardless of role.

```javascript
{
  id: String,           // Unique identifier
  name: String,         // Full name
  email: String,        // Email address (unique)
  role: Enum['student', 'tutor', 'admin'], // User role
  avatarId: String,     // Reference to avatar image
  createdAt: DateTime,  // Account creation timestamp
  lastActive: DateTime  // Last activity timestamp
}
```

### 2. Tutor
Extended profile for users with the tutor role.

```javascript
{
  id: String,              // Unique identifier (same as User.id)
  userId: String,          // Reference to User entity
  rating: Number,          // Average rating (0-5 scale)
  reviews: Number,         // Total number of reviews
  experience: Number,      // Years of tutoring experience
  subjects: String[],      // Subjects taught
  bio: String,             // Tutor biography/description
  availability: Schedule[] // Available time slots
}
```

### 3. Student
Extended profile for users with the student role.

```javascript
{
  id: String,                   // Unique identifier (same as User.id)
  userId: String,               // Reference to User entity
  enrolledSubjects: String[],   // Subjects currently studying
  studyGoals: String[],         // Learning objectives
  preferredLearningStyle: Enum  // Visual, auditory, kinesthetic, etc.
}
```

### 4. StudyPlan
AI-generated personalized learning roadmap for students.

```javascript
{
  id: String,              // Unique identifier
  studentId: String,       // Reference to Student
  subject: String,         // Academic subject
  focusArea: String,       // Specific area of focus
  overallProgress: Number, // Completion percentage (0-1 scale)
  createdAt: DateTime,     // Creation timestamp
  updatedAt: DateTime      // Last modification timestamp
}
```

### 5. WeeklyPlan
Represents a week's worth of study activities within a study plan.

```javascript
{
  id: String,         // Unique identifier
  studyPlanId: String, // Reference to StudyPlan
  weekNumber: Number,  // Week sequence number
  title: String,       // Week title/topic
  startDate: Date,     // First day of the week
  endDate: Date        // Last day of the week
}
```

### 6. Task
Individual learning activities assigned to specific days.

```javascript
{
  id: String,              // Unique identifier
  weeklyPlanId: String,    // Reference to WeeklyPlan
  title: String,           // Task title
  description: String,     // Detailed description
  day: Enum['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dueDate: Date,           // Due date for task completion
  estimatedDuration: Number, // Estimated time in minutes
  completed: Boolean,      // Completion status
  resources: Resource[]    // Learning materials
}
```

### 7. SubTask
Granular breakdown of tasks into smaller actionable items.

```javascript
{
  id: String,         // Unique identifier
  taskId: String,     // Reference to Task
  description: String, // Action item description
  completed: Boolean   // Completion status
}
```

### 8. Session
Scheduled tutoring sessions between students and tutors.

```javascript
{
  id: String,             // Unique identifier
  tutorId: String,        // Reference to Tutor
  title: String,          // Session title
  description: String,    // Session description
  dateTime: DateTime,     // Scheduled date and time
  duration: Number,       // Duration in minutes
  mode: Enum['online', 'offline'], // Delivery mode
  meetingLink: String,    // Video call link (for online sessions)
  location: String,       // Physical location (for offline sessions)
  availableSeats: Number, // Maximum participants
  attendees: String[],    // Registered participant IDs
  status: Enum['upcoming', 'in-progress', 'completed', 'cancelled']
}
```

### 9. Message
Communication between students and tutors.

```javascript
{
  id: String,          // Unique identifier
  senderId: String,    // Reference to User (sender)
  recipientId: String, // Reference to User (recipient)
  content: String,     // Message content
  timestamp: DateTime, // Send timestamp
  readStatus: Boolean  // Read/unread status
}
```

### 10. Notification
System-generated alerts for users.

```javascript
{
  id: String,            // Unique identifier
  userId: String,        // Reference to User (recipient)
  type: Enum['sessions', 'messages', 'plans', 'general'], // Notification category
  isRead: Boolean,       // Read status
  createdAt: DateTime,   // Creation timestamp
  title: String,         // Notification title
  description: String,   // Detailed description
  action: {              // Call-to-action
    label: String,       // Button text
    href: String         // Link destination
  }
}
```

### 11. Review
Feedback from students about tutors or sessions.

```javascript
{
  id: String,         // Unique identifier
  sessionId: String,  // Reference to Session
  studentId: String,  // Reference to Student
  rating: Number,     // Rating (1-5 scale)
  comment: String,    // Written feedback
  createdAt: DateTime // Timestamp
}
```

## Relationships

1. **Users and Roles**: One-to-one relationship between User and either Student or Tutor profiles
2. **Study Plans**: One-to-many relationship between Student and StudyPlan
3. **Weekly Plans**: One-to-many relationship between StudyPlan and WeeklyPlan
4. **Tasks**: One-to-many relationship between WeeklyPlan and Task
5. **SubTasks**: One-to-many relationship between Task and SubTask
6. **Sessions**: Many-to-one relationship between Session and Tutor
7. **Messages**: Many-to-many relationship between Users through Message entities
8. **Notifications**: One-to-many relationship between User and Notification
9. **Reviews**: Many-to-one relationship between Review and both Session and Student

## Key Features Supported by Schema

- **Role-based dashboards**: Differentiated by User.role field
- **AI-generated personalized study plans**: Represented by StudyPlan, WeeklyPlan, Task, and SubTask entities
- **Real-time messaging**: Implemented through Message entities
- **Tutor session management**: Handled by Session entities
- **Notification system**: Managed through Notification entities
- **Review system**: Captured through Review entities

This schema enables all core features of the MindPath AI Study Planner while maintaining flexibility for future enhancements.