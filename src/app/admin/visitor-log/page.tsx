
"use client";

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Search, 
  Filter, 
  FileDown, 
  Calendar,
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

const LOG_DATA = [
  { id: '20-12345', name: 'Juan Dela Cruz', email: 'jdelacruz@neu.edu.ph', role: 'Student', program: 'BSIT', reason: 'Researching', time: '2024-05-20 09:15 AM' },
  { id: '18-55221', name: 'Prof. Sarah Jane', email: 'sjane@neu.edu.ph', role: 'Faculty', program: 'College of Ed', reason: 'Reading', time: '2024-05-20 09:45 AM' },
  { id: '21-54321', name: 'Maria Santos', email: 'msantos@neu.edu.ph', role: 'Student', program: 'BSCS', reason: 'Use of Computer', time: '2024-05-20 10:22 AM' },
  { id: '19-98765', name: 'Robert Smith', email: 'rsmith@neu.edu.ph', role: 'Student', program: 'BSME', reason: 'Assignment', time: '2024-05-20 11:05 AM' },
  { id: '22-11002', name: 'Admin Staff Mark', email: 'mstaff@neu.edu.ph', role: 'Admin', program: 'Library Services', reason: 'Other', time: '2024-05-20 11:30 AM' },
  { id: '20-12345', name: 'Juan Dela Cruz', email: 'jdelacruz@neu.edu.ph', role: 'Student', program: 'BSIT', reason: 'Researching', time: '2024-05-19 02:15 PM' },
];

export default function VisitorLogPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Visitor Log</h1>
            <p className="text-muted-foreground">Complete history of all library visits.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary h-10 px-4 text-sm font-bold">
              Total Visitors: 4,521
            </Badge>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileDown className="mr-2 w-4 h-4" /> Export All
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-card border rounded-2xl shadow-lg">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search ID, Name, Email, Program..." 
              className="pl-10 h-11 bg-secondary/30"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Filter className="mr-2 w-4 h-4 text-primary" /> Filter by Role</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>All Roles</DropdownMenuItem>
              <DropdownMenuItem>Student</DropdownMenuItem>
              <DropdownMenuItem>Faculty</DropdownMenuItem>
              <DropdownMenuItem>Staff</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Calendar className="mr-2 w-4 h-4 text-accent" /> Date Range</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Monthly</DropdownMenuItem>
              <DropdownMenuItem>Custom Range</DropdownMenuItem>
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
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Program</TableHead>
                <TableHead className="font-bold">Reason</TableHead>
                <TableHead className="font-bold">Visit Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOG_DATA.map((log, i) => (
                <TableRow key={`${log.id}-${i}`}>
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell className="font-bold text-primary">{log.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{log.email}</TableCell>
                  <TableCell>
                    <Badge variant={log.role === 'Student' ? 'secondary' : log.role === 'Faculty' ? 'default' : 'outline'} className="text-[10px] uppercase">
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-xs">{log.program}</TableCell>
                  <TableCell className="text-xs italic">{log.reason}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{log.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
