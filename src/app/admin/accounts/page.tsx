
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
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AccountManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    idNumber: '',
    college: '',
    role: 'Student'
  });

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersRef);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Only @neu.edu.ph institutional emails are allowed."
      });
      return;
    }

    const userId = formData.idNumber || `user-${Date.now()}`;
    const userRef = doc(firestore, 'users', userId);
    const data = {
      id: userId,
      fullName: formData.fullName,
      institutionalEmail: formData.email.toLowerCase(),
      idNumber: formData.idNumber,
      college: formData.college,
      role: formData.role,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setDoc(userRef, data)
      .then(() => {
        toast({
          title: "User Added",
          description: `${formData.fullName} has been added successfully.`
        });
        setIsDialogOpen(false);
        setFormData({ fullName: '', email: '', idNumber: '', college: '', role: 'Student' });
      })
      .catch(async (error: any) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleToggleActive = (user: any) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.id);
    const newData = { isActive: !user.isActive, updatedAt: serverTimestamp() };
    
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

  const handleDeleteUser = (user: any) => {
    if (!firestore || !window.confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
    const userRef = doc(firestore, 'users', user.id);
    
    deleteDoc(userRef)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const filteredUsers = users?.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.institutionalEmail?.toLowerCase().includes(searchTerm.toLowerCase())
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
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 text-white font-bold">
                  <UserPlus className="mr-2 w-4 h-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new profile for a student or staff member.
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
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="college">College</Label>
                      <Select value={formData.college} onValueChange={(val) => setFormData({...formData, college: val})}>
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
                      <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
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
                    <Button type="submit" className="w-full">Save User Profile</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Controls Bar */}
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
              <DropdownMenuItem>All Colleges</DropdownMenuItem>
              <DropdownMenuItem>CICS</DropdownMenuItem>
              <DropdownMenuItem>Engineering</DropdownMenuItem>
              <DropdownMenuItem>Nursing</DropdownMenuItem>
              <DropdownMenuItem>Education</DropdownMenuItem>
              <DropdownMenuItem>Business</DropdownMenuItem>
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
              <DropdownMenuItem>All Types</DropdownMenuItem>
              <DropdownMenuItem>Student</DropdownMenuItem>
              <DropdownMenuItem>Librarian</DropdownMenuItem>
              <DropdownMenuItem>Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Section */}
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
                filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.idNumber || user.id}</TableCell>
                    <TableCell className="font-bold text-primary">{user.fullName}</TableCell>
                    <TableCell className="text-xs">{user.college || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase border-accent text-accent">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-accent hover:bg-accent/10" 
                          title={user.isActive ? "Block User" : "Activate User"}
                          onClick={() => handleToggleActive(user)}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                          title="Delete User"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
