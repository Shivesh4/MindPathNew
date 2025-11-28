'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  
  React.useEffect(() => {
    // Get email from URL query parameters or local storage
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // Try to get email from local storage (set during signup)
      const storedEmail = localStorage.getItem('signupEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);
  
  const handleResendEmail = () => {
    router.push('/resend-verification');
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
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent a verification link to your inbox</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>
                Please check your email inbox (and spam folder) for a verification email. 
                Click the link in the email to verify your account and complete registration.
              </AlertDescription>
            </Alert>
            
            {email && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-600">Email sent to:</p>
                <p className="font-medium">{email}</p>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline" 
                className="w-full"
              >
                Continue to Login
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <Button 
                  onClick={handleResendEmail} 
                  variant="link" 
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Resend verification email
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm">
              <Link href="/" className="underline">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}