'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  GraduationCap,
  BookOpen,
  Plus,
  XCircle,
  DollarSign,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function TutorProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const [newSubject, setNewSubject] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const fileInputRef = React.useRef(null);

  // Fetch profile data
  const fetchProfileData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      setEditForm({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        academicLevel: data.academicLevel || '',
        institution: data.institution || '',
        major: data.major || '',
        year: data.year || '',
        gpa: data.gpa || '',
        subjects: [...(data.subjects || [])],
        avatarId: data.avatarId || '',
        hourlyRate: data.hourlyRate || '',
        experience: data.experience || '',
        education: data.education || ''
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      location: profile.location || '',
      bio: profile.bio || '',
      academicLevel: profile.academicLevel || '',
      institution: profile.institution || '',
      major: profile.major || '',
      year: profile.year || '',
      gpa: profile.gpa || '',
      subjects: [...(profile.subjects || [])],
      avatarId: profile.avatarId || '',
      hourlyRate: profile.hourlyRate || '',
      experience: profile.experience || '',
      education: profile.education || ''
    });
    setNewSubject('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !editForm.subjects.includes(newSubject.trim())) {
      setEditForm(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setEditForm(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSubject();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      
      // Update the avatar ID in the form (use the full filename)
      setEditForm(prev => ({
        ...prev,
        avatarId: data.fileId  // Use the full filename with extension
      }));
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchProfileData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Profile Data</h2>
          <p className="text-muted-foreground">Unable to load profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tutor Profile</h1>
        <p className="text-muted-foreground">Manage your tutoring profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your public tutor profile</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={handleEdit} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {isEditing ? (
                      editForm.avatarId ? (
                        <AvatarImage src={`/uploads/${editForm.avatarId}`} alt={editForm.name} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {editForm.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )
                    ) : profile.avatarId ? (
                      <AvatarImage src={`/uploads/${profile.avatarId}`} alt={profile.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                      onClick={triggerFileInput}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="text-center">
                  <h3 className="text-xl font-bold">{isEditing ? editForm.name : profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined September 2023</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      placeholder="Add your location"
                      className="h-8 text-sm"
                    />
                  </div>
                ) : profile.location ? (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="italic">Add your location</span>
                  </div>
                )}
                
                {/* Tutor-specific fields in the sidebar */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      name="hourlyRate"
                      value={editForm.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="Hourly rate"
                      className="h-8 text-sm"
                    />
                  ) : profile.hourlyRate ? (
                    <span>${profile.hourlyRate}/hr</span>
                  ) : (
                    <span className="italic">Add hourly rate</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      name="experience"
                      value={editForm.experience}
                      onChange={handleInputChange}
                      placeholder="Years of experience"
                      className="h-8 text-sm"
                    />
                  ) : profile.experience ? (
                    <span>{profile.experience} years of experience</span>
                  ) : (
                    <span className="italic">Add years of experience</span>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Subjects</h4>
                  {isEditing && (
                    <span className="text-xs text-muted-foreground">Add subjects below</span>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a subject (e.g., Mathematics)"
                        className="text-sm"
                      />
                      <Button onClick={handleAddSubject} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.subjects.length > 0 ? (
                        editForm.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(subject)}
                              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No subjects added yet</p>
                      )}
                    </div>
                  </div>
                ) : profile.subjects && profile.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((subject, index) => (
                      <Badge key={index} variant="secondary">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {subject}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm italic">
                    Add subjects you're qualified to teach
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm py-2">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 text-sm py-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : profile.phone ? (
                    <div className="flex items-center gap-2 text-sm py-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm py-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="italic">Add your phone number</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                    />
                  ) : profile.location ? (
                    <div className="flex items-center gap-2 text-sm py-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm py-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="italic">Add your location</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing && (
                    <span className="text-xs text-muted-foreground">Tell students about yourself</span>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    placeholder="Share your teaching experience, qualifications, and what makes you a great tutor"
                    rows={4}
                  />
                ) : profile.bio ? (
                  <p className="text-sm py-2">{profile.bio}</p>
                ) : (
                  <div className="text-muted-foreground text-sm py-2 italic">
                    Add a bio to help students get to know you better
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tutor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Tutor Information
              </CardTitle>
              <CardDescription>Your tutoring qualifications and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  {isEditing ? (
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      value={editForm.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="Enter your hourly rate"
                    />
                  ) : profile.hourlyRate ? (
                    <p className="text-sm py-2">${profile.hourlyRate}/hour</p>
                  ) : (
                    <div className="text-muted-foreground text-sm py-2 italic">
                      Add your hourly rate
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={editForm.experience}
                      onChange={handleInputChange}
                      placeholder="Enter years of experience"
                    />
                  ) : profile.experience ? (
                    <p className="text-sm py-2">{profile.experience} years</p>
                  ) : (
                    <div className="text-muted-foreground text-sm py-2 italic">
                      Add your years of experience
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  {isEditing ? (
                    <Input
                      id="education"
                      name="education"
                      value={editForm.education}
                      onChange={handleInputChange}
                      placeholder="Enter your highest education level"
                    />
                  ) : profile.education ? (
                    <p className="text-sm py-2">{profile.education}</p>
                  ) : (
                    <div className="text-muted-foreground text-sm py-2 italic">
                      Add your education details
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicLevel">Academic Level</Label>
                  {isEditing ? (
                    <Input
                      id="academicLevel"
                      name="academicLevel"
                      value={editForm.academicLevel}
                      onChange={handleInputChange}
                      placeholder="e.g., PhD, Master's, Bachelor's"
                    />
                  ) : profile.academicLevel ? (
                    <p className="text-sm py-2">{profile.academicLevel}</p>
                  ) : (
                    <div className="text-muted-foreground text-sm py-2 italic">
                      Add your academic level
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Teaching Subjects</Label>
                  {isEditing && (
                    <span className="text-xs text-muted-foreground">Add subjects you teach</span>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a subject (e.g., Calculus, Physics)"
                      />
                      <Button onClick={handleAddSubject} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.subjects.length > 0 ? (
                        editForm.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(subject)}
                              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No subjects added yet</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.subjects && profile.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.subjects.map((subject, index) => (
                          <Badge key={index} variant="default">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm italic">
                        Add subjects you're qualified to teach
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}