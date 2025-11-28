import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const search = (searchParams.get('search') || '').trim();
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    // Build where filter
    const where = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    // Status mapping:
    // - For tutors: Active = isApproved true, Pending = isApproved false
    // - For students/admins: always Active
    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.role = 'TUTOR';
        where.isApproved = false;
      } else if (status === 'ACTIVE') {
        where.OR = [
          { role: { in: ['STUDENT', 'ADMIN'] } },
          { role: 'TUTOR', isApproved: true },
        ];
      }
    }

    if (search) {
      const orConditions = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        // Combine existing OR with search using AND
        where.AND = [{ OR: where.OR }, { OR: orConditions }];
        delete where.OR;
      } else {
        where.OR = orConditions;
      }
    }

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isApproved: true,
          isEmailVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status:
        user.role === 'TUTOR'
          ? user.isApproved
            ? 'Active'
            : 'Pending'
          : 'Active',
      isApproved: user.isApproved,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}