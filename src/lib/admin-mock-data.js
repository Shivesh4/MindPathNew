function UsersIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function ActivityIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

export const dashboardStats = [
    {
        title: "Total Users",
        value: "1,250",
        change: "+20.1% from last month",
        icon: <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    },
    {
        title: "Total Tutors",
        value: "150",
        change: "+15.2% from last month",
        icon: <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    },
    {
        title: "Active Sessions",
        value: "320",
        change: "+5.2% from last hour",
        icon: <ActivityIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
];

export const recentUsers = [
    { id: 1, name: "Liam Johnson", email: "liam@example.com", role: "Student", date: "2023-10-06" },
    { id: 2, name: "Olivia Smith", email: "olivia@example.com", role: "Tutor", date: "2023-10-06" },
    { id: 3, name: "Noah Williams", email: "noah@example.com", role: "Student", date: "2023-10-05" },
    { id: 4, name: "Emma Brown", email: "emma@example.com", role: "Student", date: "2023-10-05" },
    { id: 5, name: "James Jones", email: "james@example.com", role: "Tutor", date: "2023-10-04" },
];

export const newTutorApplications = [
    { id: 1, name: "Sophia Davis", subject: "Mathematics", status: "Pending" },
    { id: 2, name: "Logan Wilson", subject: "Physics", status: "Pending" },
    { id: 3, name: "Isabella Martinez", subject: "History", status: "Approved" },
];

export const platformHealth = [
    { name: "Database", description: "Main database cluster", status: "Operational" },
    { name: "AI Services", description: "Genkit AI models", status: "Operational" },
    { name: "API", description: "Main application API", status: "Degraded Performance" },
    { name: "Web App", description: "Frontend application", status: "Operational" },
];


export const users = [
    { id: 1, name: "Liam Johnson", email: "liam@example.com", role: "Student", status: "Active" },
    { id: 2, name: "Olivia Smith", email: "olivia@example.com", role: "Tutor", status: "Active" },
    { id: 3, name: "Noah Williams", email: "noah@example.com", role: "Student", status: "Suspended" },
    { id: 4, name: "Emma Brown", email: "emma@example.com", role: "Student", status: "Active" },
    { id: 5, name: "James Jones", email: "james@example.com", role: "Tutor", status: "Active" },
    { id: 6, name: "Sophia Davis", email: "sophia@example.com", role: "Tutor", status: "Active" },
    { id: 7, name: "Logan Wilson", email: "logan@example.com", role: "Student", status: "Active" },
    { id: 8, name: "Isabella Martinez", email: "isabella@example.com", role: "Tutor", status: "Active" },
    { id: 9, name: "Mason Taylor", email: "mason@example.com", role: "Student", status: "Active" },
    { id: 10, name: "Ava Anderson", email: "ava@example.com", role: "Student", status: "Suspended" },
];

export const sessions = [
    { id: 1, tutor: "Olivia Smith", student: "Liam Johnson", subject: "Algebra", status: "Completed", date: "2023-10-05" },
    { id: 2, tutor: "James Jones", student: "Noah Williams", subject: "Physics", status: "Upcoming", date: "2023-10-08" },
    { id: 3, tutor: "Sophia Davis", student: "Emma Brown", subject: "History", status: "Completed", date: "2023-10-04" },
    { id: 4, tutor: "Isabella Martinez", student: "Logan Wilson", subject: "Calculus", status: "Cancelled", date: "2023-10-03" },
    { id: 5, tutor: "Olivia Smith", student: "Mason Taylor", subject: "Geometry", status: "Upcoming", date: "2023-10-09" },
    { id: 6, tutor: "James Jones", student: "Ava Anderson", subject: "Chemistry", status: "Completed", date: "2023-10-02" },
];