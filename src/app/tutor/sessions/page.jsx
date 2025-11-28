'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  MessageSquare, 
  Star,
  Search,
  Filter,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import CreateSessionModal from '@/components/tutor/create-session-modal';
import RescheduleSessionModal from '@/components/tutor/reschedule-session-modal';

export default function TutorSessionsPage() {
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sessionToReschedule, setSessionToReschedule] = React.useState(null);

  // Fetch sessions from API
  const fetchSessions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      let apiStatusFilter = statusFilter;
      if (statusFilter === 'upcoming' || statusFilter === 'today') {
        apiStatusFilter = 'all';
      }
      
      const response = await fetch(`/api/sessions?status=${apiStatusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle case where data might be null or undefined
      if (data && data.sessions) {
        setSessions(data.sessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
      setSessions([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSessionCreate = React.useCallback((newSession) => {
    if (newSession) {
      setSessions((prev) => {
        const alreadyExists = prev.some((session) => session.id === newSession.id);
        if (alreadyExists) {
          return prev;
        }
        return [newSession, ...prev];
      });
    }

    fetchSessions();
  }, [fetchSessions]);

  const handleSessionRescheduled = (updatedSession) => {
    const updatedDate = updatedSession?.dateTime ? new Date(updatedSession.dateTime) : null;

    setSessions(prev =>
      prev.map(s =>
        s.id === updatedSession.id
          ? {
              ...s,
              date: updatedDate ? updatedDate.toISOString().split('T')[0] : s.date,
              time: updatedDate
                ? updatedDate.toTimeString().slice(0, 5)
                : s.time,
            }
          : s
      )
    );
    fetchSessions(); // re-fetch to ensure data is fresh and sorted
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = (session.status || '').toLowerCase();

    const matchesStatus = (() => {
      switch (statusFilter) {
        case 'all':
          return true;
        case 'upcoming':
          return ['upcoming', 'in_progress'].includes(normalizedStatus);
        case 'today': {
          const sessionDate = new Date(session.date);
          const today = new Date();
          const isSameDay =
            sessionDate.getFullYear() === today.getFullYear() &&
            sessionDate.getMonth() === today.getMonth() &&
            sessionDate.getDate() === today.getDate();
          return isSameDay && ['upcoming', 'in_progress'].includes(normalizedStatus);
        }
        case 'completed':
          return normalizedStatus === 'completed';
        default:
          return normalizedStatus === statusFilter;
      }
    })();

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    if (statusFilter === 'upcoming' || statusFilter === 'today') {
      return dateA - dateB; // Ascending for upcoming and today
    }
    return dateB - dateA; // Descending for all other filters
  });

  const getStatusColor = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <p className="text-muted-foreground">Manage sessions you've created and scheduled</p>
          </div>
          <CreateSessionModal onSessionCreate={handleSessionCreate} />
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <Button onClick={fetchSessions}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">Manage sessions you've created and scheduled</p>
        </div>
        <CreateSessionModal onSessionCreate={handleSessionCreate} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={statusFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const studentAvatar = PlaceHolderImages[session.studentAvatar];
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-muted-foreground">{session.subject || 'No Subject'}</p>
                        <Badge variant="outline" className="mt-1">
                          {session.sessionType || 'Regular Session'}
                        </Badge>
                      </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status ? session.status.replace(/_/g, ' ') : 'unknown'}
                    </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date ? formatDate(session.date) : 'No date'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time || 'No time'} ({session.duration || 0} min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {session.type === 'Online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        <span>{session.location || 'No location'}</span>
                      </div>
                    </div>
                    
                    {session.notes && (
                      <p className="text-sm text-muted-foreground mb-4">Notes: {session.notes}</p>
                    )}
                    
                    {session.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{session.rating}/5</span>
                        <span className="text-sm text-muted-foreground">rating</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {session.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Confirm Session
                        </Button>
                      )}
                      <RescheduleSessionModal
                        session={session}
                        onSessionRescheduled={handleSessionRescheduled}
                      >
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </RescheduleSessionModal>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t created any sessions yet. Create your first session to get started.'
              }
            </p>
            <CreateSessionModal onSessionCreate={handleSessionCreate} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}