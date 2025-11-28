import { notFound } from 'next/navigation';
import TutorProfileClientPage from './client-page';
import { prisma } from '@/lib/db';

export const revalidate = 0;

async function getTutorData(tutorId) {
  const [tutorRecord, sessions, reviews] = await Promise.all([
    prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            name: true,
            avatarId: true,
            bio: true,
            location: true,
          },
        },
      },
    }),
    prisma.session.findMany({
      where: {
        tutorId,
        status: 'UPCOMING',
        dateTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
      include: {
        sessionAttendees: {
          select: {
            studentId: true,
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { tutorId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                avatarId: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!tutorRecord) {
    return null;
  }

  const tutor = {
    id: tutorRecord.id,
    userId: tutorRecord.userId,
    name: tutorRecord.user?.name ?? 'Tutor',
    avatarId: tutorRecord.user?.avatarId ?? null,
    rating: typeof tutorRecord.rating === 'number' ? tutorRecord.rating : 0,
    reviews: tutorRecord.reviews ?? 0,
    experience: tutorRecord.experience ?? 0,
    subjects: tutorRecord.subjects ?? [],
    bio: tutorRecord.bio ?? tutorRecord.user?.bio ?? '',
    location: tutorRecord.user?.location ?? null,
    availability: tutorRecord.availability ?? null,
  };

  const upcomingSessions = sessions.map((session) => {
    const attendees = session.sessionAttendees.map((attendee) => attendee.studentId);
    const attendeesCount = attendees.length;
    return {
      id: session.id,
      tutorId: session.tutorId,
      title: session.title,
      description: session.description ?? '',
      dateTime: session.dateTime.toISOString(),
      duration: session.duration,
      mode: session.mode.toLowerCase(),
      meetingLink: session.meetingLink ?? null,
      location: session.location ?? null,
      availableSeats: session.availableSeats,
      seatsRemaining: Math.max(session.availableSeats - attendeesCount, 0),
      attendeesCount,
      attendees,
      status: session.status.toLowerCase(),
      sessionType: session.sessionType ?? null,
    };
  });

  const tutorReviews = reviews.map((review) => ({
    id: review.id,
    tutorId: review.tutorId ?? tutorId,
    studentId: review.studentId,
    studentName: review.student?.user?.name ?? 'Student',
    studentAvatarId: review.student?.user?.avatarId ?? null,
    rating: review.rating,
    reviewText: review.comment ?? '',
    date: review.createdAt.toISOString(),
  }));

  return { tutor, upcomingSessions, tutorReviews };
}

export default async function TutorProfilePage({ params }) {
  const resolvedParams = await params;
  const { tutorId } = resolvedParams ?? {};

  if (!tutorId) {
    notFound();
  }

  const data = await getTutorData(tutorId);

  if (!data) {
    notFound();
  }

  return (
    <TutorProfileClientPage
      tutor={data.tutor}
      upcomingSessions={data.upcomingSessions}
      initialReviews={data.tutorReviews}
    />
  );
}

