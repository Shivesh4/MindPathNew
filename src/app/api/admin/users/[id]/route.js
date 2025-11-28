import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updateData = {};

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updateData.name = body.name.trim();
    }

    if (body.role && ['STUDENT', 'TUTOR', 'ADMIN'].includes(body.role)) {
      // Prevent changing role of existing admin to non-admin
      if (existingUser.role === 'ADMIN' && body.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Cannot change role of admin user' },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    if (typeof body.isApproved === 'boolean') {
      updateData.isApproved = body.isApproved;
    }

    if (typeof body.isEmailVerified === 'boolean') {
      updateData.isEmailVerified = body.isEmailVerified;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved,
      isEmailVerified: updatedUser.isEmailVerified,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent deletion of admin users
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin users cannot be deleted' },
        { status: 403 }
      );
    }
    
    // Handle different user roles
    if (existingUser.role === 'STUDENT') {
      // Delete student-related records
      const student = await prisma.student.findUnique({
        where: { userId: id }
      });
      
      if (student) {
        // Delete related records first
        await prisma.review.deleteMany({
          where: { studentId: student.id }
        });
        
        await prisma.sessionAttendee.deleteMany({
          where: { studentId: student.id }
        });
        
        await prisma.studyPlan.deleteMany({
          where: { studentId: student.id }
        });
        
        // Delete the student record
        await prisma.student.delete({
          where: { id: student.id }
        });
      }
    } else if (existingUser.role === 'TUTOR') {
      // Delete tutor-related records
      const tutor = await prisma.tutor.findUnique({
        where: { userId: id }
      });
      
      if (tutor) {
        // Delete related records first
        await prisma.review.deleteMany({
          where: { tutorId: tutor.id }
        });
        
        await prisma.session.deleteMany({
          where: { tutorId: tutor.id }
        });
        
        // Delete the tutor record
        await prisma.tutor.delete({
          where: { id: tutor.id }
        });
      }
    }
    
    // Delete messages sent by the user
    await prisma.message.deleteMany({
      where: { senderId: id }
    });
    
    // Delete messages received by the user
    await prisma.message.deleteMany({
      where: { recipientId: id }
    });
    
    // Delete notifications
    await prisma.notification.deleteMany({
      where: { userId: id }
    });
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}