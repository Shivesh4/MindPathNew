'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Book, Search, Award } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const TUTORS_PER_PAGE = 6;

const sortTutors = (tutors, sortBy) => {
  switch (sortBy) {
    case 'reviews':
      return [...tutors].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    case 'experience':
      return [...tutors].sort((a, b) => (b.experience || 0) - (a.experience || 0));
    case 'rating':
    default:
      return [...tutors].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
};

export default function TutorsPage() {
  const [tutors, setTutors] = React.useState([]);
  const [subjects, setSubjects] = React.useState(['all']);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [subject, setSubject] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('rating');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchTutors = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(TUTORS_PER_PAGE),
      });

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      if (subject !== 'all') {
        params.set('subject', subject);
      }

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined;

      const response = await fetch(`/api/tutors?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();
      const fetchedTutors = Array.isArray(data.tutors) ? data.tutors : [];

      setTutors(sortTutors(fetchedTutors, sortBy));
      setTotalPages(data.pagination?.totalPages || 1);

      setSubjects((prev) => {
        const nextSubjects = new Set(prev.length ? prev : ['all']);
        fetchedTutors.forEach((tutor) => {
          (tutor.subjects || []).forEach((sub) => nextSubjects.add(sub));
        });
        return Array.from(nextSubjects);
      });
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err.message || 'Failed to fetch tutors');
      setTutors([]);
      setTotalPages(1);
      setSubjects(['all']);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, subject, sortBy]);

  React.useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Find a Tutor</h1>
        <p className="text-muted-foreground">Browse and connect with tutors who can help you succeed.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by tutor name..."
                className="pl-10"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={subject} onValueChange={(value) => {
              setSubject(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(sub => (
                  <SelectItem key={sub} value={sub}>
                    {sub === 'all' ? 'All Subjects' : sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="reviews">Sort by Reviews</SelectItem>
                <SelectItem value="experience">Sort by Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!loading && !error && tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tutors.map((tutor) => {
            const avatarSrc =
              tutor.avatarUrl ||
              (tutor.avatarId && PlaceHolderImages[tutor.avatarId]?.imageUrl) ||
              undefined;
            const tutorInitials =
              tutor.name
                ?.split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'TP';
            const ratingValue =
              typeof tutor.rating === 'number'
                ? tutor.rating
                : Number.isFinite(Number(tutor.rating))
                  ? Number(tutor.rating)
                  : 0;
            const ratingDisplay = ratingValue.toFixed(1);
            const reviewsCount = tutor.reviews ?? 0;
            const experienceInYears = tutor.experience ?? 0;
            const upcomingSessions = tutor.upcomingSessionsCount ?? 0;

            return (
              <Card key={tutor.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      {avatarSrc ? <AvatarImage src={avatarSrc} alt={tutor.name} /> : null}
                      <AvatarFallback>{tutorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{tutor.name || 'Tutor'}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{ratingDisplay}</span>
                        <span className="text-xs">({reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/tutors/${tutor.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View profile
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tutor.bio ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {(tutor.subjects || []).map((subj) => (
                      <span
                        key={subj}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        <Book className="mr-1 h-3 w-3" />
                        {subj}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span>{experienceInYears} yrs experience</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{upcomingSessions}</span>{' '}
                      upcoming sessions
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loading ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground">Loading tutors…</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchTutors}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); handlePreviousPage(); }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            <PaginationItem className="hidden sm:flex items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); handleNextPage(); }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {!loading && !error && tutors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No tutors found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
