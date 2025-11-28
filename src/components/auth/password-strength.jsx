'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PasswordRequirement = ({ met, text }) => (
  <div className={cn('flex items-center gap-2 text-sm', met ? 'text-green-500' : 'text-muted-foreground')}>
    {met ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
    <span>{text}</span>
  </div>
);

export default function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  return (
    <div className="space-y-2">
      <PasswordRequirement met={checks.length} text="At least 8 characters" />
      <PasswordRequirement met={checks.lowercase} text="Contains a lowercase letter" />
      <PasswordRequirement met={checks.uppercase} text="Contains an uppercase letter" />
      <PasswordRequirement met={checks.number} text="Contains a number" />
      <PasswordRequirement met={checks.special} text="Contains a special character" />
    </div>
  );
}
