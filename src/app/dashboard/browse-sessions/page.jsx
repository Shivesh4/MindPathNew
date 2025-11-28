'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MapPin, Video, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { tutors } from '@/lib/tutor-data';
import { format, parseISO } from 'date-fns';

export default function BrowseSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(new Set());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/sessions/browse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/sessions/${sessionId}/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request to join session');
      }
      
      setPendingRequests(prev => {
        const next = new Set(prev);
        next.add(sessionId);
        return next;
      });
      alert('Your join request has been sent to the tutor for approval.');
    } catch (err) {
      alert(err.message);
    }
  };

  const leaveSession = async (sessionId) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/sessions/${sessionId}/attendees`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave session');
      }
      
      // Refresh the sessions list
      fetchSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading sessions...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Sessions</h1>
        <p className="text-muted-foreground">Find and join tutoring sessions that match your interests.</p>
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No sessions available at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => {
            const tutor = tutors.find(t => t.id === session.tutorId);
            const tutorAvatar = PlaceHolderImages[tutor?.avatarId];
            
            // Check if current user is already attending this session
            const isAttending = session.isAttending;
            const hasPendingRequest = pendingRequests.has(session.id);
            
            return (
              <Card key={session.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {tutorAvatar && <AvatarImage src={tutorAvatar.imageUrl} alt={tutor?.name} data-ai-hint={tutorAvatar.imageHint}/>}
                        <AvatarFallback>{tutor?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tutor?.name}</p>
                      </div>
                    </div>
                    <Badge variant={session.status === 'upcoming' ? 'secondary' : 'default'} className="capitalize">
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{format(parseISO(session.dateTime), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {session.mode === 'ONLINE' ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-green-500" />}
                        <span className="capitalize">
                          {session.mode === 'ONLINE' ? 'Online' : `In-person${session.location ? ` @ ${session.location}` : ''}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{session.currentAttendees} / {session.availableSeats} seats taken</span>
                      </div>
                      
                      {isAttending ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => leaveSession(session.id)}
                          disabled={session.status !== 'upcoming'}
                        >
                          Leave Session
                        </Button>
                      ) : hasPendingRequest ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled
                        >
                          Pending Approval
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => joinSession(session.id)}
                          disabled={session.status !== 'upcoming' || session.currentAttendees >= session.availableSeats}
                        >
                          {session.currentAttendees >= session.availableSeats ? 'Session Full' : 'Join Session'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}