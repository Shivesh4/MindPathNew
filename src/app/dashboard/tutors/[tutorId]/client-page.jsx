'use client';

import * as React from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Book,
  Award,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

const StarRating = ({ rating, className }) => {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-tertiary text-tertiary' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
};

export default function TutorProfileClientPage({ tutor, upcomingSessions, initialReviews }) {
  const { user, loading: userLoading, fetchUser } = useUser();
  const { toast } = useToast();
  const [sessions, setSessions] = React.useState(() => upcomingSessions ?? []);
  const [joiningSessionId, setJoiningSessionId] = React.useState(null);

  React.useEffect(() => {
    setSessions(upcomingSessions ?? []);
  }, [upcomingSessions]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user && userLoading) {
      fetchUser().catch(() => {});
    }
  }, [user, userLoading, fetchUser]);

  const currentStudentId = React.useMemo(() => {
    if (user?.role === 'STUDENT') {
      return user?.student?.id ?? user?.id ?? null;
    }
    return null;
  }, [user]);

  const isStudent = user?.role === 'STUDENT';

  const sessionsWithMeta = React.useMemo(() => {
    return (sessions ?? []).map((session) => {
      const attendeeIds = session.attendees ?? [];
      const derivedSeatsRemaining =
        typeof session.seatsRemaining === 'number'
          ? session.seatsRemaining
          : Math.max(session.availableSeats - attendeeIds.length, 0);

      const isAttending = currentStudentId ? attendeeIds.includes(currentStudentId) : false;

      return {
        ...session,
        attendees: attendeeIds,
        seatsRemaining: derivedSeatsRemaining,
        isAttending,
      };
    });
  }, [sessions, currentStudentId]);

  const handleJoinSession = React.useCallback(
    async (sessionId) => {
      if (!isStudent) {
        toast({
          title: 'Join session',
          description: 'Only students can join sessions.',
          variant: 'destructive',
        });
        return;
      }

      if (!currentStudentId) {
        toast({
          title: 'Join session',
          description: 'Student profile not found for your account.',
          variant: 'destructive',
        });
        return;
      }

      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;

      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to join a session.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setJoiningSessionId(sessionId);

        const response = await fetch(`/api/sessions/${sessionId}/attendees`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to join session');
        }

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== sessionId) {
              return session;
            }

            const attendeeIds = session.attendees ?? [];
            if (attendeeIds.includes(currentStudentId)) {
              return session;
            }

            const updatedAttendeeIds = [...attendeeIds, currentStudentId];
            const updatedCount = updatedAttendeeIds.length;
            const seatsRemaining = Math.max(session.availableSeats - updatedCount, 0);

            return {
              ...session,
              attendees: updatedAttendeeIds,
              attendeesCount: updatedCount,
              seatsRemaining,
            };
          })
        );

        toast({
          title: 'Joined session',
          description: 'You have successfully joined this session.',
        });
      } catch (error) {
        console.error('Error joining session:', error);
        toast({
          title: 'Unable to join session',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setJoiningSessionId(null);
      }
    },
    [isStudent, currentStudentId, toast]
  );

  if (!tutor) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Tutor not found.</p>
      </div>
    );
  }

  const tutorReviews = initialReviews ?? [];
  const avatarImage = tutor.avatarId ? PlaceHolderImages[tutor.avatarId] : undefined;
  const ratingValue =
    typeof tutor.rating === 'number' ? tutor.rating : Number(tutor.rating || 0);
  const ratingDisplay = ratingValue.toFixed(1);
  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects : [];

  const SessionCard = ({ session }) => {
    const date = new Date(session.dateTime);
    const mode = session.mode?.toLowerCase?.() === 'offline' ? 'offline' : 'online';
    const seatsRemaining = session.seatsRemaining ?? 0;
    const isJoining = joiningSessionId === session.id;
    const description = session.description || 'Session details coming soon.';

    return (
      <Card className="mb-4">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{date.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <p className="font-semibold text-lg mb-3">{session.title}</p>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                {mode === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                <span>{mode === 'online' ? 'Online' : 'In-Person'}</span>
              </div>
              {mode === 'offline' && session.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{session.location}</span>
                </div>
              )}
              {mode === 'online' && session.meetingLink && (
                <Link
                  href={session.meetingLink}
                  target="_blank"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Meeting Link</span>
                </Link>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>
                  {seatsRemaining} of {session.availableSeats} seats available
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{session.duration} min</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex sm:flex-col items-center justify-center gap-2">
            {isStudent ? (
              <Button
                onClick={() => handleJoinSession(session.id)}
                disabled={session.isAttending || seatsRemaining <= 0 || isJoining}
                variant={session.isAttending ? 'secondary' : 'default'}
              >
                {session.isAttending
                  ? 'Joined'
                  : seatsRemaining <= 0
                  ? 'Session Full'
                  : isJoining
                  ? 'Joining...'
                  : 'Join Session'}
              </Button>
            ) : userLoading ? (
              <Button disabled>Loading...</Button>
            ) : user ? (
              <p className="text-sm text-muted-foreground text-center">
                Only students can join sessions.
              </p>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Sign in to join</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReviewCard = ({ review }) => {
    const studentAvatar = review.studentAvatarId
      ? PlaceHolderImages[review.studentAvatarId]
      : undefined;
    const reviewDate = new Date(review.date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border">
          {studentAvatar && (
            <AvatarImage
              src={studentAvatar.imageUrl}
              alt={review.studentName}
              data-ai-hint={studentAvatar.imageHint}
            />
          )}
          <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{review.studentName}</p>
              <p className="text-xs text-muted-foreground">{reviewDate}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{review.reviewText}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Tutor Profile & Reviews */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="overflow-hidden">
          <div className="h-32 bg-muted" />
          <CardContent className="pt-0 text-center">
            <Avatar className="h-24 w-24 mx-auto -mt-12 border-4 border-background">
              {avatarImage && (
                <AvatarImage
                  src={avatarImage.imageUrl}
                  alt={tutor.name}
                  data-ai-hint={avatarImage.imageHint}
                />
              )}
              <AvatarFallback>{tutor.name?.charAt(0) ?? 'T'}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mt-4">{tutor.name}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-tertiary text-tertiary" />
                <span>{ratingDisplay}</span>
              </div>
              <span>({tutor.reviews ?? tutorReviews.length} reviews)</span>
            </div>
          </CardContent>
          <div className="p-6 border-t">
            <h3 className="font-semibold mb-4">About Me</h3>
            <p className="text-sm text-muted-foreground">
              {tutor.bio || 'Tutor biography coming soon.'}
            </p>
          </div>
          <div className="p-6 border-t">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {tutor.experience} years of teaching experience
                </span>
              </div>
              {tutor.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tutor.location}</span>
                </div>
              )}
              {tutor.availability && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{tutor.availability}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Subjects:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {subjects.length > 0 ? (
                      subjects.map((sub) => (
                        <Badge key={sub} variant="secondary">
                          {sub}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Subjects coming soon.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>Student Reviews ({tutorReviews.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tutorReviews.length > 0 ? (
              <div className="space-y-6">
                {tutorReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Upcoming Sessions */}
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsWithMeta.length > 0 ? (
              sessionsWithMeta.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No available sessions at the moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

