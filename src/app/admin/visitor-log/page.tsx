
"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Search, 
  Filter, 
  FileDown, 
  Calendar,
  ChevronDown,
  User
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function VisitorLogPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const visitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('entryTime', 'desc'), limit(100));
  }, [firestore]);

  const { data: visits, isLoading } = useCollection(visitsQuery);

  const filteredVisits = visits?.filter(visit => 
    visit.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Total Recorded: {visits?.length || 0}
            </Badge>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileDown className="mr-2 w-4 h-4" /> Export Latest
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-card border rounded-2xl shadow-lg">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Email or Purpose..." 
              className="pl-10 h-11 bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Filter className="mr-2 w-4 h-4 text-primary" /> All Purposes</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>All Purposes</DropdownMenuItem>
              <DropdownMenuItem>Researching</DropdownMenuItem>
              <DropdownMenuItem>Assignment</DropdownMenuItem>
              <DropdownMenuItem>Reading</DropdownMenuItem>
              <DropdownMenuItem>Use of Computer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Calendar className="mr-2 w-4 h-4 text-accent" /> Date Filter</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Section */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="font-bold">Visitor Email</TableHead>
                <TableHead className="font-bold">Purpose</TableHead>
                <TableHead className="font-bold">Entry Date & Time</TableHead>
                <TableHead className="font-bold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground font-bold">Loading records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVisits?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    No visit records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-foreground">{visit.visitorEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-accent text-accent uppercase text-[10px]">
                        {visit.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {visit.entryTime?.toDate ? format(visit.entryTime.toDate(), 'PPP p') : 'Pending...'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-500/10 text-green-500 border-none">Checked In</Badge>
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
