'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin, 
  Video,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CreateSessionModal({ onSessionCreate }) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [date, setDate] = React.useState();
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    subject: '',
    sessionType: '',
    duration: 60,
    type: 'Online',
    location: '',
    notes: '',
    time: '',
    availableSeats: 1
  });

  const sessionTypes = [
    'Regular Session',
    'Exam Prep',
    'Assignment Help',
    'Concept Review',
    'Practice Problems',
    'Test Review'
  ];

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Biology',
    'English',
    'History',
    'Economics',
    'Calculus I',
    'Calculus II',
    'Linear Algebra',
    'Statistics'
  ];

  const durations = [30, 45, 60, 90, 120];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Prepare the data for the API call
      const sessionData = {
        subject: formData.subject,
        sessionType: formData.sessionType,
        duration: formData.duration,
        type: formData.type,
        location: formData.location,
        notes: formData.notes,
        date: date ? format(date, 'yyyy-MM-dd') : '',
        time: formData.time,
        availableSeats: Number(formData.availableSeats) || 1
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 409 && errorData.sessionId) {
          throw new Error('You already have a session scheduled at that date and time.');
        }

        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      
      // Call the onSessionCreate callback with the new session data
      if (data && data.session) {
        onSessionCreate(data.session);
      }
      
      // Close the modal and reset the form
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating session:', error);
      setErrorMessage(error.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      sessionType: '',
      duration: 60,
      type: 'Online',
      location: '',
      notes: '',
      time: '',
      availableSeats: 1
    });
    setDate(undefined);
  };

  const isFormValid = () => {
    return formData.subject && 
           formData.sessionType && 
           formData.time && 
           date &&
           formData.duration &&
           Number(formData.availableSeats) > 0;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Session
          </DialogTitle>
          <DialogDescription>
            Schedule a new tutoring session with students
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Session Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type *</Label>
                <Select value={formData.sessionType} onValueChange={(value) => handleInputChange('sessionType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mins) *</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableSeats">Available Seats *</Label>
                <Input
                  id="availableSeats"
                  type="number"
                  min={1}
                  value={formData.availableSeats}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    handleInputChange(
                      'availableSeats',
                      Number.isFinite(parsed) && parsed > 0 ? parsed : 1
                    );
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Session Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Session Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Session Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Online
                      </div>
                    </SelectItem>
                    <SelectItem value="In-Person">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        In-Person
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={formData.type === 'Online' ? 'Zoom Meeting, Google Meet, etc.' : 'Library, Classroom, etc.'}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any specific topics, materials, or instructions for this session..."
                rows={3}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Session Preview */}
          {isFormValid() && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Session Preview</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Assigned Student</h4>
                  <Badge variant="outline">{formData.sessionType}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{formData.subject}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {date ? format(date, "PPP") : 'No date selected'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formData.time || 'No time selected'}
                  </div>
                  <div className="flex items-center gap-1">
                    {formData.type === 'Online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {formData.type}
                  </div>
                  <span>{formData.duration} min</span>
                </div>
                {formData.notes && (
                  <p className="text-xs text-muted-foreground mt-2">Notes: {formData.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Session...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}