'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Calendar, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const actorAvatar = PlaceHolderImages[notification.actor.avatarId];
  
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50", !notification.isRead && "bg-muted/80")}>
      <Avatar className="h-10 w-10 border">
        {actorAvatar && <AvatarImage src={actorAvatar.imageUrl} alt={notification.actor.name} data-ai-hint={actorAvatar.imageHint} />}
        <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-medium">{notification.actor.name} <span className="font-normal text-muted-foreground">{notification.title}</span></p>
        <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
        <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
        <div className="mt-3 flex gap-2">
          {notification.action && (
            <Button asChild size="sm" variant="outline">
              <a href={notification.action.href}>{notification.action.label}</a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onMarkAsRead(notification.id)}>Mark as Read</Button>
        </div>
      </div>
      {!notification.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0"></div>}
    </div>
  );
};

export default function TutorNotificationsPage() {
  const [notifications, setNotifications] = React.useState([
    {
      id: '1',
      type: 'session',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      actor: {
        name: 'Alex Johnson',
        avatarId: 'student-avatar-1',
      },
      title: 'booked a new session with you.',
      description: 'Calculus II - Advanced Integration Techniques for tomorrow at 2:00 PM',
      action: {
        label: 'View Session',
        href: '/tutor/sessions'
      }
    },
    {
      id: '2',
      type: 'message',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      actor: {
        name: 'Emma Rodriguez',
        avatarId: 'student-avatar-2',
      },
      title: 'sent you a new message.',
      description: '"Hi Dr. Williams, I have a question about the thermodynamics problem set. Can we go over it in our next session?"',
      action: {
        label: 'Reply',
        href: '/tutor/messages'
      }
    },
    {
      id: '3',
      type: 'rating',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      actor: {
        name: 'Michael Chen',
        avatarId: 'student-avatar-3',
      },
      title: 'rated your session 5 stars.',
      description: 'Great explanation of data structures! The examples really helped me understand.',
      action: {
        label: 'View Rating',
        href: '/tutor/sessions'
      }
    },
    {
      id: '4',
      type: 'session',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      actor: {
        name: 'Sarah Kim',
        avatarId: 'student-avatar-4',
      },
      title: 'cancelled a session.',
      description: 'Physics - Thermodynamics Problem Set Review (was scheduled for today at 4:30 PM)',
    },
    {
      id: '5',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      actor: {
        name: 'MindPath System',
        avatarId: 'dashboard-mockup',
      },
      title: 'sent you a weekly report.',
      description: 'You completed 8 sessions this week with an average rating of 4.8 stars. Great job!',
      action: {
        label: 'View Report',
        href: '/tutor/analytics'
      }
    }
  ]);

  const [activeTab, setActiveTab] = React.useState('all');

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const tabs = ['all', 'unread', 'session', 'message', 'rating'];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'rating': return <Star className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <Bell className="w-8 h-8 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Stay updated with your tutoring activities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {getNotificationIcon(tab)}
                <span className="ml-2">{tab}</span>
                {tab === 'unread' && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
              You have no notifications in this category.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
