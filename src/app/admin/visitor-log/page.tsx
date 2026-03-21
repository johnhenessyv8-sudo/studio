"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Search, 
  Filter, 
  FileDown, 
  Calendar,
  ChevronDown,
  User,
  GraduationCap
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
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format, isToday, isWithinInterval, subDays, startOfDay } from 'date-fns';

export default function VisitorLogPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering State
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterCollege, setFilterCollege] = useState<string>('all');

  // Fetch Visits
  const visitsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'visits'), orderBy('entryTime', 'desc'), limit(500));
  }, [firestore, user]);

  const { data: visits, isLoading: isVisitsLoading } = useCollection(visitsQuery);

  // Fetch Users for cross-referencing college
  const usersRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersRef);

  const enrichedVisits = useMemo(() => {
    if (!visits) return [];
    return visits.map(visit => {
      const visitorEmail = visit.visitorEmail?.toLowerCase().trim();
      const userProfile = users?.find(u => u.institutionalEmail?.toLowerCase().trim() === visitorEmail);
      return {
        ...visit,
        college: userProfile?.college || 'External/Unknown'
      };
    });
  }, [visits, users]);

  const filteredVisits = useMemo(() => {
    let result = enrichedVisits.filter(visit => 
      visit.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterPurpose !== 'all') {
      result = result.filter(v => v.purpose === filterPurpose);
    }

    if (filterCollege !== 'all') {
      result = result.filter(v => v.college === filterCollege);
    }

    if (filterDate !== 'all') {
      const now = new Date();
      result = result.filter(v => {
        const entryTime = v.entryTime?.toDate ? v.entryTime.toDate() : new Date(v.entryTime);
        if (filterDate === 'today') return isToday(entryTime);
        if (filterDate === 'week') {
          return isWithinInterval(entryTime, {
            start: startOfDay(subDays(now, 7)),
            end: now
          });
        }
        return true;
      });
    }

    return result;
  }, [enrichedVisits, searchTerm, filterPurpose, filterDate, filterCollege]);

  const exportToCSV = () => {
    if (!filteredVisits || filteredVisits.length === 0) return;
    
    const headers = ["Visitor Email", "College", "Purpose", "Entry Time", "Status"];
    const rows = filteredVisits.map(v => [
      v.visitorEmail,
      v.college,
      v.purpose,
      v.entryTime?.toDate ? format(v.entryTime.toDate(), 'PPP p') : 'Pending',
      "Checked In"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEU_Library_Visitor_Logs_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = isVisitsLoading || isUsersLoading;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Visitor Log</h1>
            <p className="text-muted-foreground italic">Complete history of all library visits at New Era University.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary h-10 px-4 text-sm font-bold">
              {filteredVisits.length} Records Found
            </Badge>
            <Button onClick={exportToCSV} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-bold">
              <FileDown className="mr-2 w-4 h-4" /> Export to Excel
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-card border rounded-2xl shadow-lg">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Email, Purpose or College..." 
              className="pl-10 h-11 bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><GraduationCap className="mr-2 w-4 h-4 text-primary" /> {filterCollege === 'all' ? 'All Colleges' : filterCollege}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setFilterCollege('all')}>All Colleges</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCollege('CICS')}>CICS</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCollege('Engineering')}>Engineering</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCollege('Nursing')}>Nursing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCollege('Education')}>Education</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCollege('Business')}>Business</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Filter className="mr-2 w-4 h-4 text-accent" /> {filterPurpose === 'all' ? 'All Purposes' : filterPurpose}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setFilterPurpose('all')}>All Purposes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPurpose('Researching')}>Researching</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPurpose('Assignment')}>Assignment</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPurpose('Reading')}>Reading</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPurpose('Use of Computer')}>Use of Computer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span className="flex items-center"><Calendar className="mr-2 w-4 h-4 text-blue-400" /> {filterDate === 'all' ? 'All Time' : filterDate === 'today' ? 'Today' : 'Last 7 Days'}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setFilterDate('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDate('week')}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDate('all')}>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Section */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="font-bold px-6">Visitor Email</TableHead>
                <TableHead className="font-bold">College</TableHead>
                <TableHead className="font-bold">Purpose</TableHead>
                <TableHead className="font-bold">Entry Date & Time</TableHead>
                <TableHead className="font-bold text-right px-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground font-bold italic">Gathering Library Records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    No visit records match the current criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-foreground">{visit.visitorEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary text-[10px] font-bold uppercase tracking-tight">
                        {visit.college}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-accent text-accent uppercase text-[9px] font-black">
                        {visit.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      {visit.entryTime?.toDate ? format(visit.entryTime.toDate(), 'PPP p') : 'Processing...'}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Badge className="bg-green-500/10 text-green-500 border-none font-bold">Checked In</Badge>
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