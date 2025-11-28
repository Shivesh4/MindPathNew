# MindPath AI Study Planner

MindPath is a modern, AI-powered web application designed to connect students with tutors and provide intelligent tools for academic success. It features personalized study plans, AI-driven assistance, and seamless communication channels for a comprehensive learning experience.

## Key Features

- **Role-Based Dashboards:** Separate, tailored dashboard experiences for Students, Tutors, and Admins.
- **AI Study Planner:** Students can generate personalized study plans to organize their learning and track progress.
- **Tutor Marketplace:** A dedicated section for students to browse and connect with available tutors.
- **Integrated Messaging:** Real-time chat functionality for seamless communication between students and tutors.
- **Session Management:** Tutors can create, manage, and track their tutoring sessions.
- **AI Chatbot:** An integrated AI assistant to help users with their questions and provide support.
- **Responsive Design:** Fully responsive UI that works across desktop, tablet, and mobile devices.

## Technology Stack

- **Framework:** React
- **Language:** JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **AI/ML:** [Google AI Gemini (via Genkit)](https://firebase.google.com/docs/genkit)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Charts/Data Visualization:** [Recharts](https://recharts.org/)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repository.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd your-repository
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Reusable Components

The project includes a comprehensive set of reusable components organized by functionality:

### **UI Components** (`/components/ui/`)
Base UI components built with shadcn/ui and Tailwind CSS:
- **Layout**: `accordion`, `card`, `collapsible`, `dialog`, `sheet`, `sidebar`, `tabs`
- **Navigation**: `breadcrumb`, `menubar`, `pagination`
- **Form Elements**: `button`, `checkbox`, `input`, `label`, `radio-group`, `select`, `slider`, `switch`, `textarea`
- **Data Display**: `alert`, `alert-dialog`, `avatar`, `badge`, `calendar`, `carousel`, `chart`, `progress`, `skeleton`, `table`, `toast`, `tooltip`
- **Interactive**: `dropdown-menu`, `popover`, `resizable`, `scroll-area`, `separator`

### **Admin Components** (`/components/admin/`)
Administrative interface components:
- **`admin-breadcrumb.jsx`** - Dynamic breadcrumb navigation for admin pages
- **`admin-dashboard-header.jsx`** - Consistent header with navigation, search, and user actions
- **`admin-header-actions.jsx`** - Header action buttons and user dropdown menu

### **Authentication Components** (`/components/auth/`)
User authentication and security:
- **`password-strength.jsx`** - Password strength indicator for registration forms

### **Dashboard Components** (`/components/dashboard/`)
Student dashboard functionality:
- **`bottom-navbar.jsx`** - Mobile navigation bar for dashboard
- **`dashboard-header.jsx`** - Student dashboard header with navigation
- **`notifications.jsx`** - Notification display component
- **`study-plan-card.jsx`** - Individual study plan display card
- **`study-plan-detail.jsx`** - Detailed study plan view
- **`study-planner.jsx`** - Main study planning interface

### **Messaging Components** (`/components/dashboard/messages/`)
Real-time communication features:
- **`ai-chatbot.jsx`** - AI assistant chat interface
- **`chat-layout.jsx`** - Chat container layout
- **`chat-list.jsx`** - List of chat conversations
- **`chat-messages.jsx`** - Individual message display
- **`document-summary.jsx`** - Document analysis and summary
- **`file-upload.jsx`** - File upload functionality for chat

### **Landing Page Components** (`/components/landing/`)
Marketing and homepage sections:
- **`features-section.jsx`** - Key features showcase
- **`footer.jsx`** - Site footer with links and information
- **`header.jsx`** - Landing page header with navigation
- **`hero-section.jsx`** - Main hero banner
- **`testimonials-section.jsx`** - User testimonials display

### **Tutor Components** (`/components/tutor/`)
Tutor-specific functionality:
- **`create-session-modal.jsx`** - Modal for creating new tutoring sessions
- **`tutor-dashboard-header.jsx`** - Tutor dashboard header with navigation

## AI-Assisted Development

This project was developed with the assistance of Google's Gemini 2.5 Pro. AI was used for various tasks, including component generation, code refactoring, and logic implementation, significantly speeding up the development process.
