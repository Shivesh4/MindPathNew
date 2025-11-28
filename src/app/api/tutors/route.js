import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const subject = searchParams.get('subject')?.trim() || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
    const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filterClauses = [];

    if (subject) {
      filterClauses.push({
        subjects: {
          has: subject,
        },
      });
    }

    if (search) {
      const searchClause = {
        OR: [
          {
            user: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            bio: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            user: {
              bio: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            subjects: {
              has: search,
            },
          },
        ],
      };

      filterClauses.push(searchClause);
    }

    const whereClause =
      filterClauses.length > 0
        ? {
            user: {
              isApproved: true,
            },
            AND: filterClauses,
          }
        : {
            user: {
              isApproved: true,
            },
          };

    const [totalCount, tutors] = await Promise.all([
      prisma.tutor.count({
        where: whereClause,
      }),
      prisma.tutor.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: {
          rating: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarId: true,
              bio: true,
              location: true,
            },
          },
          sessions: {
            where: {
              status: 'UPCOMING',
              dateTime: {
                gte: new Date(),
              },
            },
            orderBy: {
              dateTime: 'asc',
            },
            select: {
              id: true,
              dateTime: true,
            },
          },
        },
      }),
    ]);

    const tutorsPayload = tutors.map((tutor) => {
      const nextSession = tutor.sessions[0]?.dateTime ?? null;
      return {
        id: tutor.id,
        userId: tutor.userId,
        name: tutor.user?.name ?? '',
        avatarId: tutor.user?.avatarId ?? null,
        rating: tutor.rating,
        reviews: tutor.reviews,
        experience: tutor.experience,
        subjects: tutor.subjects,
        bio: tutor.bio ?? tutor.user?.bio ?? '',
        location: tutor.user?.location ?? null,
        availability: tutor.availability ?? null,
        upcomingSessionsCount: tutor.sessions.length,
        nextAvailableSession: nextSession ? nextSession.toISOString() : null,
      };
    });

    return NextResponse.json({
      tutors: tutorsPayload,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}