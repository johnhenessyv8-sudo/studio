"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Search, 
  Filter, 
  Trash2, 
  Ban, 
  ArrowUpDown,
  UserPlus,
  Mail,
  User as UserIcon,
  BookOpen,
  ChevronDown,
  Loader2,
  MoreVertical,
  Edit2,
  CheckCircle2,
  Key
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export default function AccountManagement() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    idNumber: '',
    college: '',
    role: 'Student'
  });

  const usersRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);

  const { data: users, isLoading } = useCollection(usersRef);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || isSaving) return;

    if (!formData.email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Only @neu.edu.ph institutional emails are allowed."
      });
      return;
    }

    setIsSaving(true);

    try {
      const secondaryAppName = `secondary-app-${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      
      const authUser = await createUserWithEmailAndPassword(secondaryAuth, formData.email.toLowerCase(), "mypassword123");
      const uid = authUser.user.uid;

      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      const userRef = doc(firestore, 'users', uid);
      const data = {
        id: uid,
        fullName: formData.fullName,
        institutionalEmail: formData.email.toLowerCase(),
        idNumber: formData.idNumber,
        college: formData.college,
        role: formData.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, data);

      toast({
        title: "User Created",
        description: `${formData.fullName} added. Default password: mypassword123`
      });
      
      setIsAddOpen(false);
      setFormData({ fullName: '', email: '', idNumber: '', college: '', role: 'Student' });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Ensure the email isn't already in use."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingUser || isSaving) return;

    setIsSaving(true);
    const userRef = doc(firestore, 'users', editingUser.id);
    const updatedData = {
      fullName: editingUser.fullName,
      idNumber: editingUser.idNumber,
      college: editingUser.college,
      role: editingUser.role,
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(userRef, updatedData);
      toast({
        title: "Profile Updated",
        description: "User details have been saved successfully."
      });
      setIsEditOpen(false);
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Link Sent",
        description: `Password reset email sent to ${email}`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handleToggleActive = (userItem: any) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userItem.id);
    const newData = { isActive: !userItem.isActive, updatedAt: serverTimestamp() };
    
    updateDoc(userRef, newData)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: newData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteUser = (userItem: any) => {
    if (!firestore || !window.confirm(`Are you sure you want to permanently delete ${userItem.fullName}?`)) return;
    const userRef = doc(firestore, 'users', userItem.id);
    
    deleteDoc(userRef)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const filteredUsers = users?.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institutionalEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Account Management</h1>
            <p className="text-muted-foreground">Manage library user permissions and profiles.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary h-10 px-4 text-sm font-bold">
              Total Users: {users?.length || 0}
            </Badge>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 text-white font-bold">
                  <UserPlus className="mr-2 w-4 h-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Account will be created in Auth with default password: <b>mypassword123</b>
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        placeholder="Juan Dela Cruz" 
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Institutional Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="jdelacruz@neu.edu.ph" 
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">Student/Staff ID</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="idNumber" 
                        placeholder="20-12345" 
                        className="pl-10"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="college">College</Label>
                      <Select 
                        value={formData.college} 
                        onValueChange={(val) => setFormData({...formData, college: val})}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CICS">CICS</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(val) => setFormData({...formData, role: val})}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Librarian">Librarian</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                      {isSaving ? "Creating User..." : "Save User Profile"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-card border rounded-2xl shadow-lg">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Name or ID..." 
              className="pl-10 h-11 bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Filter className="mr-2 w-4 h-4 text-primary" /> College</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setSearchTerm('')}>All Colleges</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('CICS')}>CICS</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Engineering')}>Engineering</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Nursing')}>Nursing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Education')}>Education</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Business')}>Business</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><ArrowUpDown className="mr-2 w-4 h-4 text-accent" /> Sort By</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem>ID Number</DropdownMenuItem>
              <DropdownMenuItem>Type</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Filter className="mr-2 w-4 h-4 text-primary" /> Type</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setSearchTerm('')}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Student')}>Student</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Librarian')}>Librarian</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm('Admin')}>Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Table */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="font-bold">ID Number</TableHead>
                <TableHead className="font-bold">Full Name</TableHead>
                <TableHead className="font-bold">College</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.idNumber || u.id}</TableCell>
                    <TableCell className="font-bold text-primary">{u.fullName}</TableCell>
                    <TableCell className="text-xs">{u.college || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase border-accent text-accent">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={u.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => { setEditingUser(u); setIsEditOpen(true); }}>
                              <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(u)}>
                              <Ban className="w-4 h-4 mr-2 text-accent" /> {u.isActive ? 'Block User' : 'Unblock User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(u.institutionalEmail)}>
                              <Key className="w-4 h-4 mr-2 text-blue-500" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDeleteUser(u)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
              <DialogDescription>Modify information for {editingUser?.fullName}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingUser?.fullName || ''}
                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-id">ID Number</Label>
                <Input 
                  id="edit-id" 
                  value={editingUser?.idNumber || ''}
                  onChange={(e) => setEditingUser({...editingUser, idNumber: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>College</Label>
                  <Select 
                    value={editingUser?.college || ''} 
                    onValueChange={(val) => setEditingUser({...editingUser, college: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CICS">CICS</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Nursing">Nursing</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={editingUser?.role || ''} 
                    onValueChange={(val) => setEditingUser({...editingUser, role: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Librarian">Librarian</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="animate-spin mr-2" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
