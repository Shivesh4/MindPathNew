'use client';

import * as React from 'react';
import { notifications as allNotifications } from '@/lib/notification-data';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
                        <Button asChild size="sm">
                            <Link href={notification.action.href}>{notification.action.label}</Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => onMarkAsRead(notification.id)}>Mark as Read</Button>
                </div>
            </div>
            {!notification.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0"></div>}
        </div>
    );
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = React.useState(allNotifications);
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

    const tabs = ['all', 'unread', 'sessions', 'messages', 'plans'];

    return (
        <div className="w-full space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-3xl">
                        <Bell className="w-8 h-8 text-primary" />
                        Notifications
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark All as Read
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            {tabs.map(tab => (
                                <TabsTrigger key={tab} value={tab} className="capitalize">
                                    {tab}
                                    {tab === 'unread' && (
                                        <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                            {notifications.filter(n => !n.isRead).length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
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
