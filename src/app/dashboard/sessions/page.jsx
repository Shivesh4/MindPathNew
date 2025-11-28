'use client';

import * as React from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Clock, MapPin, Video, Users, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG = {
  upcoming: { badge: 'secondary', border: 'border-primary' },
  completed: { badge: 'default', border: 'border-green-500' },
  cancelled: { badge: 'destructive', border: 'border-destructive' },
};

const SessionCard = ({ session }) => {
  const tutor = session.tutor;
  const tutorAvatar =
    tutor?.avatarId && PlaceHolderImages[tutor.avatarId]
      ? PlaceHolderImages[tutor.avatarId]
      : null;
  const sessionDate = new Date(session.dateTime);
  const statusConfig = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.upcoming;
  const attendeesCount = (session.attendees ?? []).length;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-lg border-l-4',
        statusConfig.border
      )}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0 flex flex-col items-center gap-2 w-full sm:w-24">
          <Avatar className="h-16 w-16">
            {tutorAvatar && (
              <AvatarImage
                src={tutorAvatar.imageUrl}
                alt={tutor?.name}
                data-ai-hint={tutorAvatar.imageHint}
              />
            )}
            <AvatarFallback>{tutor?.name?.charAt(0) ?? 'T'}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium text-center line-clamp-2">{tutor?.name ?? 'Tutor'}</p>
        </div>

        <div className="flex-grow w-full border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-bold text-xl leading-tight">{session.title}</h3>
            <Badge variant={statusConfig.badge} className="capitalize shrink-0">
              {session.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                {sessionDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{session.duration} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              {session.mode === 'online' ? (
                <Video className="w-4 h-4 text-blue-500" />
              ) : (
                <MapPin className="w-4 h-4 text-green-500" />
              )}
              <span className="capitalize">
                {session.mode}
                {session.mode === 'offline' && session.location ? ` @ ${session.location}` : ''}
              </span>
            </div>
          </div>

          {session.description ? (
            <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
          ) : null}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{`${attendeesCount} participant${attendeesCount === 1 ? '' : 's'}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tutors/${session.tutorId}`}>View Tutor Profile</Link>
                  </DropdownMenuItem>
                  {session.status === 'completed' && (
                    <DropdownMenuItem>Leave a Review</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {session.status === 'upcoming' && session.meetingLink ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                    Join Online
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DateSelector = ({ selectedDate, onDateChange }) => {
  const today = startOfToday();
  const dates = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i)),
    [today]
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-7 gap-2 rounded-lg bg-muted p-2">
        {dates.map((date) => (
          <Button
            key={date.toISOString()}
            variant={isSameDay(date, selectedDate) ? 'default' : 'ghost'}
            onClick={() => onDateChange(date)}
            className="flex flex-col h-auto p-2"
          >
            <span className="text-xs">{format(date, 'EEE')}</span>
            <span className="font-bold text-lg">{format(date, 'd')}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

const SessionList = ({ items, emptyMessage }) => {
  if (!items.length) {
    return (
      <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
};

export default function SessionsPage() {
  const { user, loading: userLoading, fetchUser } = useUser();
  const { toast } = useToast();
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(startOfToday());
  const [activeTab, setActiveTab] = React.useState('upcoming');

  const loadSessions = React.useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = window.localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/sessions/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load sessions');
      }

      const normalizedSessions = (data.sessions ?? []).map((session) => ({
        ...session,
        dateObj: new Date(session.dateTime),
      }));

      setSessions(normalizedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const message = err.message || 'Failed to load sessions';
      setError(message);
      toast({
        title: 'Unable to fetch sessions',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!user && userLoading) {
      fetchUser().catch(() => {});
      return;
    }

    if (userLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      setSessions([]);
      return;
    }

    if (user.role !== 'STUDENT') {
      setError('My Sessions is only available to student accounts.');
      setLoading(false);
      return;
    }

    loadSessions();
  }, [user, userLoading, fetchUser, loadSessions]);

  const sessionsForSelectedDay = React.useMemo(() => {
    const upcoming = [];
    const completed = [];
    const cancelled = [];

    sessions.forEach((session) => {
      if (!isSameDay(session.dateObj, selectedDate)) {
        return;
      }

      switch (session.status) {
        case 'completed':
          completed.push(session);
          break;
        case 'cancelled':
          cancelled.push(session);
          break;
        default:
          upcoming.push(session);
          break;
      }
    });

    return {
      upcoming,
      completed,
      cancelled,
    };
  }, [sessions, selectedDate]);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">
            Review your upcoming and past tutoring sessions.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/browse-sessions">Browse Available Sessions</Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading your sessions…</div>
      ) : error ? (
        <div className="py-20 text-center text-destructive">{error}</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({sessionsForSelectedDay.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({sessionsForSelectedDay.completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({sessionsForSelectedDay.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <TabsContent value="upcoming">
            <SessionList
              items={sessionsForSelectedDay.upcoming}
              emptyMessage="No upcoming sessions for this day."
            />
          </TabsContent>
          <TabsContent value="completed">
            <SessionList
              items={sessionsForSelectedDay.completed}
              emptyMessage="No completed sessions for this day."
            />
          </TabsContent>
          <TabsContent value="cancelled">
            <SessionList
              items={sessionsForSelectedDay.cancelled}
              emptyMessage="No cancelled sessions for this day."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}