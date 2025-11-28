'use client';

import { useState, useEffect } from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import TutorApprovals from "@/components/admin/tutor-approvals"
import { UsersIcon, ActivityIcon } from 'lucide-react'
import StatCard from "@/components/admin/stat-card"

export default function AdminDashboard() {
    const [dashboardStats, setDashboardStats] = useState([
        {
            title: "Total Users",
            value: "0",
            change: "+0% from last month",
            icon: <UsersIcon className="w-5 h-5 text-blue-500" />,
            color: "bg-blue-100 dark:bg-blue-900/50",
            changeColor: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Total Tutors",
            value: "0",
            change: "+0% from last month",
            icon: <UsersIcon className="w-5 h-5 text-green-500" />,
            color: "bg-green-100 dark:bg-green-900/50",
            changeColor: "text-green-600 dark:text-green-400"
        },
        {
            title: "Active Sessions",
            value: "0",
            change: "+0% from last hour",
            icon: <ActivityIcon className="w-5 h-5 text-purple-500" />,
            color: "bg-purple-100 dark:bg-purple-900/50",
            changeColor: "text-purple-600 dark:text-purple-400"
        }
    ]);
    
    const [recentUsers, setRecentUsers] = useState([]);
    const [tutorApplications, setTutorApplications] = useState([]);
    const [loading, setLoading] = useState({
        stats: true,
        users: true,
        applications: true
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                
                if (response.ok) {
                    // Update the stats with real data
                    const updatedStats = [
                        {
                            title: "Total Users",
                            value: data.totalUsers.toLocaleString(),
                            change: "+0% from last month",
                            icon: <UsersIcon className="w-5 h-5 text-blue-500" />,
                            color: "bg-blue-100 dark:bg-blue-900/50",
                            changeColor: "text-blue-600 dark:text-blue-400"
                        },
                        {
                            title: "Total Tutors",
                            value: data.totalTutors.toLocaleString(),
                            change: "+0% from last month",
                            icon: <UsersIcon className="w-5 h-5 text-green-500" />,
                            color: "bg-green-100 dark:bg-green-900/50",
                            changeColor: "text-green-600 dark:text-green-400"
                        },
                        {
                            title: "Active Sessions",
                            value: data.activeSessions.toLocaleString(),
                            change: "+0% from last hour",
                            icon: <ActivityIcon className="w-5 h-5 text-purple-500" />,
                            color: "bg-purple-100 dark:bg-purple-900/50",
                            changeColor: "text-purple-600 dark:text-purple-400"
                        }
                    ];
                    
                    setDashboardStats(updatedStats);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(prev => ({ ...prev, stats: false }));
            }
        };

        const fetchRecentUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                
                if (response.ok) {
                    setRecentUsers(data);
                }
            } catch (error) {
                console.error('Error fetching recent users:', error);
            } finally {
                setLoading(prev => ({ ...prev, users: false }));
            }
        };

        const fetchTutorApplications = async () => {
            try {
                const response = await fetch('/api/admin/tutor-applications');
                const data = await response.json();
                
                if (response.ok) {
                    setTutorApplications(data);
                }
            } catch (error) {
                console.error('Error fetching tutor applications:', error);
            } finally {
                setLoading(prev => ({ ...prev, applications: false }));
            }
        };

        fetchDashboardStats();
        fetchRecentUsers();
        fetchTutorApplications();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-6">
            {dashboardStats.map((stat, index) => (
                <StatCard key={index} stat={stat} loading={loading.stats} />
            ))}

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>A list of the most recent user sign-ups.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading.users ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'STUDENT' ? 'outline' : 'default'}>
                                                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Tutor Approvals Component */}
            <div className="col-span-4">
                <TutorApprovals />
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>New Tutor Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading.applications ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tutorApplications.map((tutor) => (
                                    <TableRow key={tutor.id}>
                                        <TableCell>{tutor.name}</TableCell>
                                        <TableCell>{tutor.email}</TableCell>
                                        <TableCell>{tutor.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={tutor.status === 'Pending' ? 'destructive' : 'default'}>
                                                {tutor.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Database</p>
                            <p className="text-sm text-gray-500">Main database cluster</p>
                        </div>
                        <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">AI Services</p>
                            <p className="text-sm text-gray-500">Genkit AI models</p>
                        </div>
                        <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">API</p>
                            <p className="text-sm text-gray-500">Main application API</p>
                        </div>
                        <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Web App</p>
                            <p className="text-sm text-gray-500">Frontend application</p>
                        </div>
                        <Badge variant="default">Operational</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}