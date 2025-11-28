'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TutorApprovals() {
  const [tutors, setTutors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState({});

  React.useEffect(() => {
    fetchPendingTutors();
  }, []);

  const fetchPendingTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tutors');
      const data = await response.json();
      setTutors(data.tutors);
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'approve' }));
      const response = await fetch('/api/admin/tutors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'approve' }),
      });
      
      if (response.ok) {
        // Remove the approved tutor from the list
        setTutors(prev => prev.filter(tutor => tutor.id !== userId));
      } else {
        const error = await response.json();
        console.error('Error approving tutor:', error.error);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
    } finally {
      setActionLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[userId];
        return newLoading;
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'reject' }));
      const response = await fetch('/api/admin/tutors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'reject' }),
      });
      
      if (response.ok) {
        // Remove the rejected tutor from the list
        setTutors(prev => prev.filter(tutor => tutor.id !== userId));
      } else {
        const error = await response.json();
        console.error('Error rejecting tutor:', error.error);
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
    } finally {
      setActionLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[userId];
        return newLoading;
      });
    }
  };

  if (loading) {
    return <div>Loading pending tutor approvals...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Approvals</CardTitle>
        <CardDescription>Review and approve pending tutor applications</CardDescription>
      </CardHeader>
      <CardContent>
        {tutors.length === 0 ? (
          <p className="text-center py-4">No pending tutor approvals</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.name}</TableCell>
                  <TableCell>{tutor.email}</TableCell>
                  <TableCell>
                    {tutor.tutor?.subjects?.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="mr-1">
                        {subject}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{tutor.tutor?.bio || 'No bio provided'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(tutor.id)}
                        disabled={actionLoading[tutor.id] === 'approve'}
                      >
                        {actionLoading[tutor.id] === 'approve' ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(tutor.id)}
                        disabled={actionLoading[tutor.id] === 'reject'}
                      >
                        {actionLoading[tutor.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}