'use client';

import { useState, useEffect } from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState({});
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        role: 'STUDENT',
        isApproved: true,
        isEmailVerified: false,
    });
    const [savingEdit, setSavingEdit] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        role: 'ALL',
        status: 'ALL',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filters.role, filters.status]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(pagination.page),
                pageSize: String(pagination.pageSize),
            });

            if (filters.search.trim()) {
                params.append('search', filters.search.trim());
            }
            if (filters.role !== 'ALL') {
                params.append('role', filters.role);
            }
            if (filters.status !== 'ALL') {
                params.append('status', filters.status);
            }

            const response = await fetch(`/api/admin/users/all?${params.toString()}`);
            const data = await response.json();
            
            if (response.ok) {
                setUsers(data.users);
                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }));
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch users.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "An error occurred while fetching users.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleting(prev => ({ ...prev, [userId]: true }));
            
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                // Remove the deleted user from the list
                setUsers(prev => prev.filter(user => user.id !== userId));
                toast({
                    title: "Success",
                    description: `User ${userName} has been deleted successfully.`,
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.error || "Failed to delete user.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the user.",
                variant: "destructive",
            });
        } finally {
            setDeleting(prev => {
                const newDeleting = { ...prev };
                delete newDeleting[userId];
                return newDeleting;
            });
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleFilterChange = (field, value) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    const toggleSelectUser = (userId) => {
        setSelectedUserIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const toggleSelectAllCurrentPage = () => {
        setSelectedUserIds(prev => {
            const allIds = users.map(u => u.id);
            const allSelected = allIds.every(id => prev.has(id));
            if (allSelected) {
                // Deselect all on this page
                const next = new Set(prev);
                allIds.forEach(id => next.delete(id));
                return next;
            }
            // Select all on this page
            const next = new Set(prev);
            allIds.forEach(id => next.add(id));
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedUserIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} user(s)? This cannot be undone.`)) {
            return;
        }
        try {
            const response = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    userIds: Array.from(selectedUserIds),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error || "Failed to run bulk delete.",
                    variant: "destructive",
                });
                return;
            }
            setUsers(prev => prev.filter(u => !data.deleted.includes(u.id)));
            clearSelection();
            toast({
                title: "Bulk delete completed",
                description: `Deleted ${data.deleted.length}, skipped ${data.skipped.length}, failed ${data.failed.length}.`,
            });
        } catch (error) {
            console.error('Error in bulk delete:', error);
            toast({
                title: "Error",
                description: "An error occurred while running bulk delete.",
                variant: "destructive",
            });
        }
    };

    const handleBulkApproveTutors = async () => {
        if (selectedUserIds.size === 0) return;
        try {
            const response = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approveTutors',
                    userIds: Array.from(selectedUserIds),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error || "Failed to approve tutors.",
                    variant: "destructive",
                });
                return;
            }
            setUsers(prev => prev.map(user => {
                const updated = data.updated.find(u => u.id === user.id);
                if (!updated) return user;
                return {
                    ...user,
                    isApproved: true,
                    status: 'Active',
                };
            }));
            toast({
                title: "Bulk approval completed",
                description: `Updated ${data.updated.length} tutor(s).`,
            });
        } catch (error) {
            console.error('Error in bulk tutor approval:', error);
            toast({
                title: "Error",
                description: "An error occurred while approving tutors.",
                variant: "destructive",
            });
        }
    };

    const handleBulkUpdateRole = async (newRole) => {
        if (selectedUserIds.size === 0) return;
        try {
            const response = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateRole',
                    userIds: Array.from(selectedUserIds),
                    role: newRole,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update roles.",
                    variant: "destructive",
                });
                return;
            }
            setUsers(prev => prev.map(user => {
                const updated = data.updated.find(u => u.id === user.id);
                if (!updated) return user;
                const next = { ...user, role: updated.role };
                if (next.role === 'TUTOR') {
                    next.status = next.isApproved ? 'Active' : 'Pending';
                }
                return next;
            }));
            toast({
                title: "Bulk role update completed",
                description: `Updated ${data.updated.length} user(s).`,
            });
        } catch (error) {
            console.error('Error in bulk role update:', error);
            toast({
                title: "Error",
                description: "An error occurred while updating roles.",
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            role: user.role || 'STUDENT',
            isApproved: user.isApproved ?? true,
            isEmailVerified: user.isEmailVerified ?? false,
        });
    };

    const closeEditDialog = () => {
        setEditingUser(null);
        setSavingEdit(false);
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        try {
            setSavingEdit(true);
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update user.",
                    variant: "destructive",
                });
                return;
            }

            setUsers(prev => prev.map(user => {
                if (user.id !== editingUser.id) return user;
                const updated = {
                    ...user,
                    name: data.name,
                    role: data.role,
                    isApproved: data.isApproved,
                    isEmailVerified: data.isEmailVerified,
                };
                // Recompute status for tutors based on approval
                if (updated.role === 'TUTOR') {
                    updated.status = updated.isApproved ? 'Active' : 'Pending';
                }
                return updated;
            }));

            toast({
                title: "Success",
                description: "User updated successfully.",
            });
            closeEditDialog();
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Error",
                description: "An error occurred while updating the user.",
                variant: "destructive",
            });
        } finally {
            setSavingEdit(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>A list of all the users in your platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>A list of all the users in your platform.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-64">
                            <div className="relative w-full">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email"
                                    className="pl-8"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="outline" size="icon">
                                <Search className="h-4 w-4" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </form>
                        <div className="flex gap-2">
                            <Select
                                value={filters.role}
                                onValueChange={(value) => handleFilterChange('role', value)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All roles</SelectItem>
                                    <SelectItem value="STUDENT">Students</SelectItem>
                                    <SelectItem value="TUTOR">Tutors</SelectItem>
                                    <SelectItem value="ADMIN">Admins</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="PENDING">Pending (tutors)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {selectedUserIds.size > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2 items-center text-sm">
                        <span className="text-muted-foreground">
                            {selectedUserIds.size} selected
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            Bulk Delete
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkApproveTutors}
                        >
                            Approve Selected Tutors
                        </Button>
                        <Select
                            onValueChange={(value) => handleBulkUpdateRole(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Bulk change role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Set role to Student</SelectItem>
                                <SelectItem value="TUTOR">Set role to Tutor</SelectItem>
                                <SelectItem value="ADMIN">Set role to Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                        >
                            Clear selection
                        </Button>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    onChange={toggleSelectAllCurrentPage}
                                    checked={users.length > 0 && users.every(u => selectedUserIds.has(u.id))}
                                    aria-label="Select all users on this page"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedUserIds.has(user.id)}
                                        onChange={() => toggleSelectUser(user.id)}
                                        aria-label={`Select user ${user.name}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'STUDENT' ? 'outline' : 'default'}>
                                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.role !== 'ADMIN' ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    disabled={deleting[user.id]}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {deleting[user.id] ? 'Deleting...' : 'Delete'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <div className="text-muted-foreground text-sm">
                                            Admin user
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <strong>{(pagination.page - 1) * pagination.pageSize + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)}</strong> of <strong>{pagination.total}</strong> users
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page * pagination.pageSize >= pagination.total}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>

            <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                        <DialogDescription>
                            Update basic details and status. Changes take effect immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value) => handleEditChange('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="TUTOR">Tutor</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                                <Label className="flex items-center gap-1">
                                    Tutor approved
                                    <span className="text-xs text-muted-foreground">(tutors only)</span>
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Controls whether a tutor account is active or pending.
                                </p>
                            </div>
                            <Switch
                                checked={!!editForm.isApproved}
                                onCheckedChange={(checked) => handleEditChange('isApproved', checked)}
                                disabled={editForm.role !== 'TUTOR'}
                                aria-label="Tutor approval status"
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                                <Label>Email verified</Label>
                                <p className="text-xs text-muted-foreground">
                                    Marks whether the user has completed email verification.
                                </p>
                            </div>
                            <Switch
                                checked={!!editForm.isEmailVerified}
                                onCheckedChange={(checked) => handleEditChange('isEmailVerified', checked)}
                                aria-label="Email verification status"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={savingEdit}>
                            {savingEdit && (
                                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-background" />
                            )}
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}