const now = new Date();

export const notifications = [
    {
        id: '1',
        type: 'sessions',
        isRead: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        actor: {
            name: 'Sarah Williams',
            avatarId: 'tutor-avatar-1',
        },
        title: 'booked a new session with you.',
        description: 'Calculus II - Advanced Integration Techniques',
        action: {
            label: 'View Session',
            href: '/dashboard/sessions'
        }
    },
    {
        id: '2',
        type: 'messages',
        isRead: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actor: {
            name: 'Michael Chen',
            avatarId: 'tutor-avatar-3',
        },
        title: 'sent you a new message.',
        description: '"Hey, just wanted to confirm our session for tomorrow. Let me know if you have any specific topics you want to cover!"',
        action: {
            label: 'Reply',
            href: '/dashboard/messages'
        }
    },
    {
        id: '3',
        type: 'plans',
        isRead: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actor: {
            name: 'MindPath AI',
            avatarId: 'dashboard-mockup',
        },
        title: 'updated your study plan.',
        description: 'Your Physics study plan has been optimized based on your recent progress.',
        action: {
            label: 'View Plan',
            href: '/dashboard/progress/physics-em'
        }
    },
    {
        id: '4',
        type: 'sessions',
        isRead: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        actor: {
            name: 'Emma Rodriguez',
            avatarId: 'tutor-avatar-2',
        },
        title: 'cancelled a session.',
        description: 'Thermodynamics Problem Set Review',
    },
    {
        id: '5',
        type: 'general',
        isRead: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        actor: {
            name: 'MindPath Team',
            avatarId: 'dashboard-mockup',
        },
        title: 'posted a new announcement.',
        description: 'New feature alert! You can now sync your study plans with your Google Calendar.',
    }
];
