'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PasswordStrength from '@/components/auth/password-strength';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState('student');
  const [bio, setBio] = React.useState(''); // For tutors
  const [subjects, setSubjects] = React.useState(''); // For tutors
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const isPasswordStrong =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password);

  const passwordsMatch = password === confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role,
          bio: role === 'tutor' ? bio : undefined,
          subjects: role === 'tutor' ? subjects.split(',').map(s => s.trim()).filter(s => s) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred during signup.');
      }
      
      setSuccess(data.message);
      
      // Store email in localStorage for the check email page
      localStorage.setItem('signupEmail', email);
      
      // For student signup, redirect to a page that explains next steps
      if (role === 'student') {
        setTimeout(() => {
          router.push('/check-email');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div className="w-full max-w-md">
       <Link href="/" className="flex items-center justify-center mb-8 gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">MindPath</span>
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your information to get started.</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="bg-green-100 border-green-500 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {password && <PasswordStrength password={password} />}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {!passwordsMatch && confirmPassword && (
                <Alert variant="destructive">
                  <AlertDescription>Passwords do not match.</AlertDescription>
                </Alert>
              )}
              
              {role === 'tutor' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about your teaching experience"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subjects">Subjects (comma separated)</Label>
                    <Input
                      id="subjects"
                      placeholder="Math, Physics, Chemistry"
                      value={subjects}
                      onChange={(e) => setSubjects(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div className="grid gap-2">
                <Label>I am a...</Label>
                <RadioGroup
                  defaultValue="student"
                  className="flex gap-4"
                  onValueChange={setRole}
                  value={role}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="role-student" />
                    <Label htmlFor="role-student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tutor" id="role-tutor" />
                    <Label htmlFor="role-tutor">Tutor</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isPasswordStrong || !passwordsMatch || loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}