'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  TrendingUp, 
  MessageSquare,
  Video,
  Phone,
  MapPin,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import CreateSessionModal from '@/components/tutor/create-session-modal';
import TutorCard from '@/components/tutor/tutor-card';
import { useToast } from '@/hooks/use-toast';

export default function TutorDashboard() {
  // Fallback for when useUser is not available
  const [user, setUser] = React.useState(null);
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);
  const [sessionsError, setSessionsError] = React.useState(null);
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    sessionsThisWeek: 0,
    averageRating: 0,
    hoursThisWeek: 0,
  });
  const [students, setStudents] = React.useState([]);
  const [studentsLoading, setStudentsLoading] = React.useState(true);
  const [studentsError, setStudentsError] = React.useState(null);
  
  React.useEffect(() => {
    // Try to get user from localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);
  
  React.useEffect(() => {
    const fetchSessionsForStats = async () => {
      if (typeof window === 'undefined') return;
      try {
        setSessionsLoading(true);
        setSessionsError(null);
        const token = window.localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }
        // Fetch a reasonable number of sessions for stats + upcoming list
        const response = await fetch('/api/sessions?status=all&limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load sessions');
        }
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];

        // Reconstruct full Date object for each session
        const sessionsWithDate = sessions.map((session) => {
          const dateTime = new Date(`${session.date}T${session.time}`);
          return { ...session, _dateTime: dateTime };
        });

        // Upcoming sessions: next few future sessions
        const now = new Date();
        const upcoming = sessionsWithDate
          .filter((s) => s._dateTime.getTime() >= now.getTime())
          .sort((a, b) => a._dateTime.getTime() - b._dateTime.getTime())
          .slice(0, 5)
          .map(({ _dateTime, ...rest }) => rest);
        setUpcomingSessions(upcoming);

        // Stats: sessions in the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const sessionsThisWeekList = sessionsWithDate.filter(
          (s) =>
            s._dateTime.getTime() >= weekAgo.getTime() &&
            s._dateTime.getTime() <= now.getTime()
        );

        const sessionsThisWeek = sessionsThisWeekList.length;
        const hoursThisWeek =
          sessionsThisWeekList.reduce(
            (sum, s) => sum + (Number(s.duration) || 0),
            0
          ) / 60;

        setStats((prev) => ({
          ...prev,
          sessionsThisWeek,
          hoursThisWeek: Number.isFinite(hoursThisWeek)
            ? Number(hoursThisWeek.toFixed(1))
            : 0,
        }));
      } catch (error) {
        console.error('Error fetching sessions for stats:', error);
        setSessionsError(error.message || 'Failed to load sessions');
        setUpcomingSessions([]);
        toast({
          title: 'Unable to load sessions',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessionsForStats();
  }, [toast]);

  // Fetch real students data for stats + recent students
  React.useEffect(() => {
    const fetchStudents = async () => {
      if (typeof window === 'undefined') return;
      try {
        setStudentsLoading(true);
        setStudentsError(null);
        const token = window.localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }
        const response = await fetch('/api/tutor/students', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load students');
        }
        const studentsData = Array.isArray(data.students) ? data.students : [];
        setStudents(studentsData);

        const totalStudents = studentsData.length;
        const ratedStudents = studentsData.filter(
          (s) => typeof s.averageRating === 'number'
        );
        const averageRating =
          ratedStudents.length > 0
            ? ratedStudents.reduce(
                (sum, s) => sum + (s.averageRating || 0),
                0
              ) / ratedStudents.length
            : 0;

        setStats((prev) => ({
          ...prev,
          totalStudents,
          averageRating: Number.isFinite(averageRating)
            ? Number(averageRating.toFixed(1))
            : 0,
        }));
      } catch (error) {
        console.error('Error fetching tutor students for dashboard:', error);
        setStudentsError(error.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const [availableTutors, setAvailableTutors] = React.useState([]);
  const [loadingTutors, setLoadingTutors] = React.useState(true);
  
  // Fetch available tutors
  React.useEffect(() => {
    const fetchAvailableTutors = async () => {
      try {
        setLoadingTutors(true);
        const response = await fetch('/api/tutors?limit=6');
        if (response.ok) {
          const data = await response.json();
          console.log('Available tutors data:', data); // Debug log
          console.log('Tutors array:', data.tutors); // Debug log
          setAvailableTutors(data.tutors || []);
        } else {
          console.error('Failed to fetch tutors, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching available tutors:', error);
      } finally {
        setLoadingTutors(false);
      }
    };
    
    fetchAvailableTutors();
  }, []);

  const handleSessionCreate = (newSession) => {
    if (!newSession) return;
    setUpcomingSessions((prev) => {
      const exists = prev.some((s) => s.id === newSession.id);
      if (exists) return prev;
      return [newSession, ...prev];
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Tutor'}</p>
        </div>
        <div className="flex gap-2">
          <CreateSessionModal onSessionCreate={handleSessionCreate} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              +0.1 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursThisWeek}h</div>
            <p className="text-xs text-muted-foreground">
              +2.5h from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Your scheduled tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionsLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Loading upcoming sessions…
                </div>
              ) : sessionsError ? (
                <div className="py-10 text-center text-destructive text-sm">
                  {sessionsError}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  You don&apos;t have any upcoming sessions yet. Create one to get started.
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const dateTime = new Date(`${session.date}T${session.time}`);
                  const isOnline = session.type === 'Online';
                  const attendeesCount = Array.isArray(session.attendees)
                    ? session.attendees.length
                    : 0;
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {session.subject?.charAt(0)?.toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">
                            {session.subject || session.sessionType || 'Session'}
                          </h4>
                          <Badge
                            variant={
                              session.status === 'upcoming' || session.status === 'in_progress'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {session.status?.replace(/_/g, ' ') || 'upcoming'}
                          </Badge>
                        </div>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{dateTime.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {dateTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isOnline ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            <span>{isOnline ? 'Online' : 'In-Person'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {attendeesCount}/{session.availableSeats} attendees
                            </span>
                          </div>
                          <span>{session.duration} min</span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Notes: {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Students */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Students
              </CardTitle>
              <CardDescription>
                Students you've worked with recently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentsLoading ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  Loading recent students…
                </div>
              ) : studentsError ? (
                <div className="py-6 text-center text-destructive text-sm">
                  {studentsError}
                </div>
              ) : students.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  You don&apos;t have any students yet.
                </div>
              ) : (
                [...students]
                  .sort((a, b) => {
                    const aDate =
                      a.lastSessionDate || a.nextSessionDate || a.joinDate;
                    const bDate =
                      b.lastSessionDate || b.nextSessionDate || b.joinDate;
                    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
                  })
                  .slice(0, 3)
                  .map((student) => {
                    const placeholderAvatar =
                      student.avatarId && PlaceHolderImages[student.avatarId]
                        ? PlaceHolderImages[student.avatarId]
                        : null;
                    const lastSessionLabel = student.lastSessionDate
                      ? new Date(student.lastSessionDate).toLocaleDateString()
                      : 'No sessions yet';
                    const primarySubject =
                      (student.subjects && student.subjects[0]) ||
                      'General studies';
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          {placeholderAvatar ? (
                            <AvatarImage
                              src={placeholderAvatar.imageUrl}
                              alt={student.name}
                              data-ai-hint={placeholderAvatar.imageHint}
                            />
                          ) : null}
                          <AvatarFallback>
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm">
                            {student.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {primarySubject}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {student.averageRating
                                  ? student.averageRating.toFixed(1)
                                  : 'N/A'}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {student.totalSessions} sessions
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Last session: {lastSessionLabel}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Available Tutors Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Tutors
            </CardTitle>
            <CardDescription>
              Browse other tutors in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTutors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-200 h-12 w-12 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : availableTutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No available tutors found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}