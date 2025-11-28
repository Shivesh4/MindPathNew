'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Book, MapPin, Calendar } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function TutorCard({ tutor }) {
  const tutorAvatar = tutor.avatarId ? PlaceHolderImages[tutor.avatarId] : null;
  
  // Format the next available session date
  const getNextSessionText = () => {
    if (!tutor.nextAvailableSession) return 'No upcoming sessions';
    
    const date = new Date(tutor.nextAvailableSession);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {tutorAvatar && (
              <AvatarImage 
                src={tutorAvatar.imageUrl} 
                alt={tutor.name} 
                data-ai-hint={tutorAvatar.imageHint}
              />
            )}
            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-lg">{tutor.name}</CardTitle>
            <CardDescription className="line-clamp-2">{tutor.bio || 'No bio available'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{tutor.rating}</span>
            <span className="text-muted-foreground">({tutor.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{tutor.experience} years experience</span>
          </div>
          
          {tutor.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{tutor.location}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {tutor.subjects.slice(0, 3).map((subject, index) => (
              <Badge key={index} variant="secondary">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 3 && (
              <Badge variant="secondary">
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{tutor.upcomingSessionsCount} upcoming sessions</span>
          </div>
          <span>{getNextSessionText()}</span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/dashboard/tutors/${encodeURIComponent(tutor.id)}`}>
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}