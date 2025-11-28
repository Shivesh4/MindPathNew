## MindPath AI Study Planner – Source of Truth

This document is the **single source of truth** for the MindPath AI Study Planner web app. It describes the product’s **roles, features, user journeys, data model, and key technical behaviors** so designers, engineers, QA, and stakeholders align on how the system is supposed to work.

---

## 1. Core Concept

- **Product vision**: Help students succeed academically by combining **AI-powered study planning**, a **tutor marketplace**, and **communication tools** in a single platform.
- **Primary personas**:
  - **Student**: Creates an account, verifies email, manages their profile, generates and tracks study plans, browses tutors/sessions, joins tutoring sessions, chats (human + AI assistant), and monitors progress.
  - **Tutor**: Applies via sign-up, waits for admin approval, manages their tutor profile, creates and manages sessions, views students, and communicates with them.
  - **Admin**: Manages users, tutors, and platform health/metrics. Approves or rejects tutor applications and can delete non-admin users.

---

## 2. Roles, Permissions, and Authentication

- **Roles**:
  - `STUDENT`
  - `TUTOR`
  - `ADMIN`

- **Authentication & Identity**
  - Credentials: Email + password, stored as **bcrypt** hashes.
  - **Student sign-up**:
    - Creates a `User` record with role `STUDENT`.
    - `isEmailVerified = false` until they complete the email verification flow.
    - Cannot log in until verification completes.
  - **Tutor sign-up**:
    - Creates `User` with role `TUTOR` and a linked `Tutor` profile with bio/subjects.
    - `isApproved = false` until an admin approves.
    - Cannot log in until approved.
  - **Admin**:
    - Pre-created admin account (see `AUTHENTICATION_SUMMARY.md`).
    - Has full access to admin dashboard and management APIs.

- **Auth flows & supporting features**
  - **Email verification**:
    - On sign-up, a verification email is sent.
    - `/api/auth/verify-email` handles verification token.
    - After verification, student can log in and access dashboard.
  - **Password policies**:
    - Min 8 chars, with lower, upper, digit, and special character.
  - **Password reset**:
    - `/forgot-password` → `/api/auth/forgot-password`: request reset link via email.
    - `/reset-password` → `/api/auth/reset-password`: set new password using token.
  - **Sessions / auth tokens**:
    - Client stores an `authToken` (JWT-like) in `localStorage`.
    - Authenticated API requests send `Authorization: Bearer <token>`.
    - Middleware and utilities in `src/lib/auth` and `src/lib/middleware` validate tokens, enforce roles, and protect routes.
  - **Email service**:
    - Implemented via Nodemailer, configured to use your SMTP account.
    - Used for verification, password reset, and notifications (e.g., tutor approval).

---

## 3. High-Level Application Structure

- **Frontend framework**: Next.js App Router (`/src/app/**`) with React and Tailwind + shadcn/ui.
- **Major app entry points**
  - `/` – Marketing / landing page with hero, features, testimonials, and footer.
  - `/login` – Role-based login using real authentication.
  - `/signup` – Student/Tutor sign-up with role selection and validation.
  - `/verify-email`, `/check-email` – Email verification and guidance screens.
  - `/forgot-password`, `/reset-password` – Password recovery flow.
  - `/dashboard/**` – Student dashboard and tools.
  - `/tutor/**` – Tutor dashboard and tools.
  - `/admin/**` – Admin dashboard and management screens.

- **API routes (non-exhaustive but conceptually grouped)**
  - **Auth**: `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/verify-email`, `/api/auth/resend-verification`.
  - **Profile**: `/api/profile` (GET/PUT) for authenticated user profile data.
  - **Sessions**:
    - `/api/sessions` (core CRUD helpers).
    - `/api/sessions/my` – current user’s sessions (student).
    - `/api/sessions/browse` – browseable sessions (student).
    - `/api/sessions/[sessionId]` – details + updates.
    - `/api/sessions/[sessionId]/attendees` – join/leave session.
    - `/api/tutors/[tutorId]/sessions` – tutor-specific session data.
  - **Tutors**:
    - `/api/tutors` – public tutor discovery (cards, summaries).
  - **Admin**:
    - `/api/admin/stats` – aggregated platform metrics.
    - `/api/admin/users` – recent users listing.
    - `/api/admin/users/all` – full, paginated user list.
    - `/api/admin/users/[id]` – user deletion.
    - `/api/admin/tutor-applications` – recent tutor applications snapshot.
    - `/api/admin/tutors` – list + approve/reject tutor applications.
  - **Upload**:
    - `/api/upload` – authenticated file upload endpoint, used for profile avatar.

---

## 4. User Journeys and Workflows

### 4.1 Student

- **Onboarding & Authentication**
  - Visits `/` (marketing landing page).
  - Goes to `/signup`, selects **Student**.
  - Completes the sign-up form (enforced password strength).
  - Receives email verification link, is redirected to `/check-email`.
  - Clicks verification link → `isEmailVerified = true` → can log in at `/login`.

- **Dashboard (`/dashboard`)**
  - Sees a **Dashboard** overview:
    - **Study Planner** (`<StudyPlanner />`): main content area where the student can view or generate study plans (powered by AI flows and `progress-data`).
    - **Notifications**: side column showing key alerts (session reminders, plan updates, etc.).
  - Layout is responsive with grid-based structure.

- **Messages (`/dashboard/messages`)**
  - Sees a messaging interface built using `ChatLayout` and related components.
  - Contacts list includes:
    - **AI Assistant** (AI chatbot contact, file upload + document analysis).
    - Human tutors and peers.
  - Can:
    - Start AI conversations (Q&A, document summary, etc.).
    - Chat with tutors about assignments, upcoming sessions, and feedback.

- **Sessions – Personal (`/dashboard/sessions`)**
  - Uses **My Sessions** view which:
    - Loads authenticated student sessions via `/api/sessions/my` with `Authorization: Bearer <token>`.
    - Requires role `STUDENT`; shows an error if not.
  - UX:
    - Date selector (7-day window) to filter sessions by date.
    - Tabs for **Upcoming**, **Completed**, **Cancelled**.
    - Each session shows tutor info, duration, time, mode (online/offline), attendees, and quick actions:
      - View tutor profile (`/dashboard/tutors/[tutorId]`).
      - Join meeting link for upcoming online sessions.
      - (Future) Leave a review for completed sessions.
  - Entry point to discover more sessions via CTA: **Browse Available Sessions** (link to `/dashboard/browse-sessions`).

- **Sessions – Discovery (`/dashboard/browse-sessions`)**
  - Student can browse all available sessions:
    - Data from `/api/sessions/browse` (requires auth header).
    - Each card shows tutor avatar, tutor name, session title, date/time, duration, mode, and seats (e.g., `currentAttendees / availableSeats`).
  - Interactions:
    - **Join Session** (POST to `/api/sessions/[sessionId]/attendees`).
    - **Leave Session** (DELETE same endpoint) if already attending.
    - Buttons disabled if session is full or not upcoming.

- **Tutors Discovery (`/dashboard/tutors/**`)**
  - Browses list of tutors, views detailed tutor pages and ratings.
  - Can navigate to a tutor’s profile at `/dashboard/tutors/[tutorId]` and see related sessions.

- **Profile Management (`/dashboard/profile`)**
  - Fetches authenticated profile via `/api/profile` (GET).
  - Edits and saves via `/api/profile` (PUT).
  - Profile fields:
    - Identity: `name`, `email` (read-only), `phone`, `location`, `bio`.
    - Academic info: `academicLevel`, `institution`, `major`, `year`, `gpa`.
    - Interests: `subjects` (list of tags).
    - Avatar: `avatarId` (file reference).
  - Key interactions:
    - Toggle **Edit** mode.
    - Update personal and academic details.
    - Manage subject tags (add/remove).
    - Upload avatar via `/api/upload` with image type/size validation.
  - Uses toasts to communicate errors/success to the user.

- **Progress (`/dashboard/progress`)**
  - **My Progress** dashboard:
    - Renders cards from `studyPlans` (mock/seeded data) showing current study plans.
    - Each plan drills down into weekly tasks and completion status.
  - Conceptually tied to database models `StudyPlan`, `WeeklyPlan`, `Task`, and `SubTask`.

- **Settings (`/dashboard/settings`)**
  - Placeholder for account-level settings and preferences (language, notifications, etc.) to be expanded.

---

### 4.2 Tutor

- **Onboarding**
  - Sign-up as **Tutor** via `/signup` with additional tutor-specific details (bio, subjects).
  - Account created with:
    - Role `TUTOR`.
    - `isApproved = false`.
  - Appears in admin **Tutor Approvals** queue.
  - Receives email when approved/rejected (via `sendTutorApprovalNotification`).
  - Once approved, can log in via `/login` to access tutor dashboard.

- **Tutor Dashboard (`/tutor`)**
  - Greets tutor with name (from `user` stored in `localStorage` as fallback).
  - Shows:
    - **Stats cards**: Total students, sessions this week, average rating, hours this week.
    - **Upcoming sessions list** (initially seeded demo data, can be extended to pull real sessions from API).
    - **Recent students** with names, subjects, last session, rating, and total sessions.
    - **Available Tutors** section (for cross-discovery), loaded from `/api/tutors?limit=6`.
  - Key interactions:
    - **Create Session**:
      - Invokes `CreateSessionModal` to define new sessions (title, description, schedule, mode, seats).
      - On success, new session is added into the upcoming sessions list and persisted via appropriate API.
    - **Session controls**:
      - View upcoming sessions with join/start CTAs.
      - (Future) Manage rescheduling and cancellations.

- **Tutor Navigation (`/tutor/**`)**
  - Additional pages:
    - `/tutor/sessions` – full list of tutor sessions.
    - `/tutor/profile` – tutor profile management (similar structure to student profile but tailored).
    - `/tutor/students` – list of authored students with quick stats.
    - `/tutor/messages`, `/tutor/notifications`, `/tutor/settings` – communication and configuration.

---

### 4.3 Admin

- **Admin Dashboard (`/admin`)**
  - Data-backed cards showing:
    - Total users, total tutors, active sessions (from `/api/admin/stats`).
  - **Recent Users** table:
    - Loaded from `/api/admin/users`.
    - Displays name, email, role (with badges), and sign-up date.
  - **Tutor Approvals**:
    - Embedded `TutorApprovals` component using `/api/admin/tutors`.
    - Admin can approve or reject tutor applications:
      - `PUT /api/admin/tutors` with `{ userId, action: "approve" | "reject" }`.
  - **New Tutor Applications**:
    - Summary table loaded from `/api/admin/tutor-applications`.
  - **Platform Health** section:
    - Shows status of database, AI services, API, and web app (static/derived statuses for now).

- **User Management (`/admin/users`)**
  - Paginated table of all users:
    - Data from `/api/admin/users/all?page=1&pageSize=10`.
    - Shows id, name, email, role, status (Active/Pending).
  - Interactions:
    - **Delete user** via `DELETE /api/admin/users/[id]`.
    - **Admin protection**:
      - Cannot delete admin users (guarded in backend and frontend).
      - Backend returns `403` if attempted.

- **Security Guarantees**
  - All admin routes validate that the requesting user is an `ADMIN`.
  - Admin endpoints operate over the same Prisma data model as rest of the platform.

---

## 5. Data Model Overview (Conceptual)

Backed by Prisma + Supabase Postgres (see `schema.prisma` and `DATABASE_SETUP.md`).

- **Key models**
  - `User`: base identity with role and security flags.
  - `Student`: extended profile (academic info, preferences).
  - `Tutor`: extended profile (bio, subjects, rating, etc.).
  - `StudyPlan` → `WeeklyPlan` → `Task` → `SubTask`: hierarchy of learning plans.
  - `Session`: scheduled tutoring session (title, description, mode, duration, location, seats).
  - `SessionAttendee`: link between `Session` and attending students; tracks membership and maybe status.
  - `Message`: messages between users (including AI interactions).
  - `Notification`: system alerts for users (approval, reminders).
  - `Review`: feedback from students on sessions/tutors.

- **Key relationships**
  - `User` 1–1 `Student` or `Tutor` (depending on role).
  - `Tutor` 1–N `Session`.
  - `Session` N–N `User` (students) through `SessionAttendee`.
  - `User` 1–N `StudyPlan`, which fan out into nested plans and tasks.
  - `User` 1–N `Message` (sent, received).
  - `User` 1–N `Notification`.
  - `Session` 1–N `Review`.

---

## 6. AI Features

- **AI Study Planner**
  - Exposed through:
    - Dashboard `StudyPlanner` component.
    - `Progress` and `study-plan-detail` views built around structured plan data.
  - Currently uses seeded/structured data; can be extended to call the same Groq backend used by the chatbot to generate plans dynamically.

- **AI Chatbot / Document Assistant**
  - Implemented as an AI contact within messaging:
    - `ai-chatbot` component for conversational UI.
    - `document-summary` and `file-upload` components for document-centric workflows (upload → summarise → Q&A).
  - Uses **Groq** (e.g. `llama-3.1-70b-versatile`) via the `/api/ai/chat` backend as the model provider for:
    - Free-form Q&A.
    - Context-aware explanations.
    - Document-name–based summaries, quizzes, and flashcard suggestions.

---

## 7. Cross-Cutting Concerns

- **Authorization & Route Protection**
  - Student-only routes (e.g., `/dashboard/sessions`, `/dashboard/browse-sessions`) require:
    - Valid token.
    - Role check where applicable.
  - Tutor routes require a valid token and `TUTOR` role.
  - Admin routes require `ADMIN` role.

- **Error Handling & UX**
  - Most API calls:
    - Show loading states (spinners, skeletons).
    - Render friendly error messages to users.
    - Log detailed errors to console for debugging.
  - Toasts (`use-toast`) are used extensively for:
    - Success feedback (profile saved, upload complete).
    - Failure feedback (auth issues, network failures).

- **File Uploads**
  - Profile pictures:
    - Uploaded via `/api/upload`, stored under `/public/uploads`.
    - Stored reference as `avatarId` (filename).
    - Client enforces:
      - Image-only (`file.type.startsWith('image/')`).
      - Max size 5MB.

- **Responsiveness & UI**
  - Layouts are fully responsive:
    - Grid-based dashboards.
    - Mobile bottom navigation for student dashboard.
    - Cards, tabs, and modals built using shadcn/ui primitives.

---

## 8. Non-Functional Expectations

- **Security**
  - All passwords hashed with bcrypt.
  - Email verification and tutor approval before granting access.
  - Planned enhancements:
    - Production-grade sessions using secure cookies/JWT.
    - Rate limiting on auth endpoints.
    - Optional 2FA.

- **Performance**
  - API endpoints structured for pagination where needed (e.g., users list).
  - Frontend uses efficient data-fetching patterns and skeleton/loading states.

- **Extensibility**
  - New features should:
    - Reuse existing data models (`StudyPlan`, `Session`, `Notification`) when possible.
    - Integrate with role-based access control.
    - Use established UI primitives and layout patterns for a consistent UX.

---

## 9. How to Use This Document

- **Product & Design**: Use this as the canonical description of what the app currently supports and how flows are intended to behave. When proposing new UX, reference sections above to keep flows consistent.
- **Engineering**: Use this to understand where to plug new features (routes, models, components) and how auth + data flow should work.
- **QA**: Use the **User Journeys and Workflows** section as a baseline for regression and acceptance test scenarios.


