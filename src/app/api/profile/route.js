import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

export async function GET(request) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(request);
    if (authError) {
      return authError;
    }
    
    const userId = request.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user data with related student/tutor information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        tutor: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the response based on user role
    let profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarId: user.avatarId,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      academicLevel: user.academicLevel,
      institution: user.institution,
      major: user.major,
      year: user.year,
      gpa: user.gpa,
      subjects: []
    };

    // Add role-specific data
    if (user.role === 'STUDENT' && user.student) {
      profileData.subjects = user.student.enrolledSubjects || [];
    } else if (user.role === 'TUTOR' && user.tutor) {
      profileData.subjects = user.tutor.subjects || [];
      profileData.hourlyRate = user.tutor.hourlyRate;
      profileData.experience = user.tutor.experience;
      profileData.education = user.tutor.education;
    }

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(request);
    if (authError) {
      return authError;
    }
    
    const userId = request.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Prepare user data update object with only valid fields
    const userData = {};
    if (data.name !== undefined) userData.name = data.name;
    if (data.avatarId !== undefined) userData.avatarId = data.avatarId;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.location !== undefined) userData.location = data.location;
    if (data.bio !== undefined) userData.bio = data.bio;
    if (data.academicLevel !== undefined) userData.academicLevel = data.academicLevel;
    if (data.institution !== undefined) userData.institution = data.institution;
    if (data.major !== undefined) userData.major = data.major;
    if (data.year !== undefined) userData.year = data.year;
    if (data.gpa !== undefined) userData.gpa = data.gpa;

    // Update user data if there are user fields to update
    let updatedUser;
    if (Object.keys(userData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userData
      });
    } else {
      // If no user fields to update, just fetch the current user
      updatedUser = await prisma.user.findUnique({
        where: { id: userId }
      });
    }

    // Update role-specific data
    let updatedSubjects = [];
    if (updatedUser.role === 'STUDENT') {
      // Get the student record
      const student = await prisma.student.findUnique({
        where: { userId: updatedUser.id }
      });
      
      if (student) {
        let updatedStudent;
        if (data.subjects !== undefined) {
          updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
              enrolledSubjects: data.subjects || []
            }
          });
        } else {
          updatedStudent = student;
        }
        updatedSubjects = updatedStudent.enrolledSubjects || [];
      }
    } else if (updatedUser.role === 'TUTOR') {
      // Get the tutor record
      const tutor = await prisma.tutor.findUnique({
        where: { userId: updatedUser.id }
      });
      
      if (tutor) {
        let updatedTutor;
        if (data.subjects !== undefined) {
          updatedTutor = await prisma.tutor.update({
            where: { id: tutor.id },
            data: {
              subjects: data.subjects || [],
              hourlyRate: data.hourlyRate || undefined,
              experience: data.experience || undefined,
              education: data.education || undefined
            }
          });
        } else {
          // Only update other tutor fields if provided
          const tutorData = {};
          if (data.hourlyRate !== undefined) tutorData.hourlyRate = data.hourlyRate;
          if (data.experience !== undefined) tutorData.experience = data.experience;
          if (data.education !== undefined) tutorData.education = data.education;
          
          if (Object.keys(tutorData).length > 0) {
            updatedTutor = await prisma.tutor.update({
              where: { id: tutor.id },
              data: tutorData
            });
          } else {
            updatedTutor = tutor;
          }
        }
        updatedSubjects = updatedTutor.subjects || [];
      }
    }

    // Return updated profile data
    const profileData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarId: updatedUser.avatarId,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      academicLevel: updatedUser.academicLevel,
      institution: updatedUser.institution,
      major: updatedUser.major,
      year: updatedUser.year,
      gpa: updatedUser.gpa,
      subjects: updatedSubjects
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}