# Admin Panel Implementation

## Overview

The admin panel is a comprehensive dashboard that provides administrators with tools to manage users, tutors, and platform statistics. It includes real-time data visualization, user management capabilities, and tutor approval workflows.

## Architecture

The admin panel follows a client-server architecture with:

1. **Frontend**: React components using Next.js App Router
2. **Backend**: RESTful API routes for data fetching and operations
3. **Database**: PostgreSQL via Prisma ORM

## Components

### 1. Main Dashboard (`/src/app/admin/page.jsx`)

The main dashboard displays key platform metrics and recent activity:

#### Features:
- **Statistics Cards**: Shows total users, total tutors, and active sessions
- **Recent Users Table**: Displays the 5 most recent user sign-ups
- **Tutor Approvals Component**: Embedded component for managing tutor applications
- **New Tutor Applications Table**: Shows the 5 most recent tutor applications
- **Platform Health Status**: Displays the operational status of platform services

#### Data Sources:
- `/api/admin/stats` - Platform statistics
- `/api/admin/users` - Recent users
- `/api/admin/tutor-applications` - Recent tutor applications

### 2. User Management (`/src/app/admin/users/page.jsx`)

Full user management interface with pagination and deletion capabilities:

#### Features:
- **User Listing**: Paginated table of all platform users
- **Role-based Display**: Shows user roles with appropriate badges
- **Status Indicators**: Displays user status (Active/Pending)
- **Deletion Functionality**: Allows deletion of non-admin users with confirmation
- **Admin Protection**: Prevents deletion of admin users both frontend and backend

#### Data Sources:
- `/api/admin/users/all` - Paginated user list
- `/api/admin/users/[id]` - User deletion endpoint

### 3. Tutor Approvals (`/src/components/admin/tutor-approvals.jsx`)

Dedicated component for managing tutor applications:

#### Features:
- **Pending Applications**: Lists all tutors awaiting approval
- **Approval/Rejection**: Allows admins to approve or reject tutor applications
- **Subject Display**: Shows tutor's listed subjects
- **Bio Information**: Displays tutor's bio information

#### Data Sources:
- `/api/admin/tutors` - Pending tutor applications
- `/api/admin/tutors` (PUT) - Approve/reject tutors

## API Endpoints

### Dashboard Statistics
```
GET /api/admin/stats
```
Returns:
```json
{
  "totalUsers": 150,
  "totalTutors": 25,
  "activeSessions": 8
}
```

### Recent Users
```
GET /api/admin/users
```
Returns:
```json
[
  {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "date": "2023-05-15"
  }
]
```

### Recent Tutor Applications
```
GET /api/admin/tutor-applications
```
Returns:
```json
[
  {
    "id": "tutor-id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Mathematics",
    "status": "Pending"
  }
]
```

### All Users (Paginated)
```
GET /api/admin/users/all?page=1&pageSize=10
```
Returns:
```json
{
  "users": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "status": "Active"
    }
  ],
  "total": 150
}
```

### User Deletion
```
DELETE /api/admin/users/[id]
```
Returns:
```json
{
  "message": "User deleted successfully"
}
```

### Tutor Management
```
GET /api/admin/tutors
```
Returns:
```json
{
  "tutors": [
    {
      "id": "tutor-id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "tutor": {
        "subjects": ["Mathematics", "Physics"],
        "bio": "Experienced math tutor"
      },
      "isApproved": false
    }
  ]
}
```

```
PUT /api/admin/tutors
Body: { "userId": "tutor-id", "action": "approve" | "reject" }
```
Returns:
```json
{
  "message": "Tutor approved successfully"
}
```

## Security Features

### 1. Admin User Protection
- Backend validation prevents deletion of admin users
- Frontend hides delete options for admin users
- Returns 403 Forbidden when attempting to delete admin users

### 2. Role-based Access
- Only users with ADMIN role can access admin panel
- API endpoints validate user permissions

### 3. Data Integrity
- Cascading deletion ensures related records are properly removed
- Foreign key constraints prevent orphaned data

## Implementation Details

### Data Fetching
- Uses React `useEffect` hooks for initial data loading
- Implements loading states for better UX
- Handles API errors gracefully

### User Interface
- Responsive design using Tailwind CSS
- Shadcn/ui components for consistent UI
- Loading indicators during data operations
- Confirmation dialogs for destructive actions

### Error Handling
- Comprehensive error handling in all API routes
- User-friendly error messages
- Console logging for debugging

## Future Enhancements

1. **Advanced Filtering**: Add search and filter capabilities to user lists
2. **User Editing**: Allow admins to edit user information
3. **Analytics Dashboard**: Add more detailed platform analytics
4. **Audit Logs**: Track admin actions for security compliance
5. **Bulk Operations**: Enable bulk user management actions