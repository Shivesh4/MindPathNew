'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [resending, setResending] = React.useState(false);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    // Get userId and email from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (userId) {
      handleEmailVerification(userId);
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, []);

  const handleEmailVerification = async (userId) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('The verification link is invalid or expired. The user account may have been deleted.');
        }
        throw new Error(data.error || 'Error verifying email. The link may be invalid or expired.');
      }
      
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email not found. Please try signing up again.');
      return;
    }
    
    setResending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error resending verification email.');
      }
      
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8 gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">MindPath</span>
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>Verifying your email address</CardDescription>
          </CardHeader>
          
          <CardContent>
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
            
            <div className="mt-4 text-center">
              {success ? (
                <Button onClick={() => router.push('/login')} className="w-full">
                  Go to Login
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                    Back to Home
                  </Button>
                  <div className="text-sm">
                    Didn't receive the email?{' '}
                    <Link href="/resend-verification" className="text-blue-600 hover:underline">
                      Resend verification email
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}