'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileDown,
  Loader2 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { startOfWeek, startOfMonth, format } from 'date-fns';

export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const visitsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'visits');
  }, [firestore, user]);
  
  const { data: visits, isLoading: isVisitsLoading } = useCollection(visitsRef);

  const usersRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);
  
  const { data: users, isLoading: isUsersLoading } = useCollection(usersRef);

  const stats = useMemo(() => {
    if (!visits || !users) return { today: 0, week: 0, month: 0, purposeData: [], collegeData: [], recent: [] };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    const purposes: Record<string, number> = {};
    const colleges: Record<string, number> = {};

    visits.forEach(v => {
      let entryTime: Date;
      if (v.entryTime?.toDate) {
        entryTime = v.entryTime.toDate();
      } else if (v.entryTime instanceof Date) {
        entryTime = v.entryTime;
      } else {
        entryTime = new Date(v.entryTime);
      }
      
      if (entryTime >= todayStart) todayCount++;
      if (entryTime >= weekStart) weekCount++;
      if (entryTime >= monthStart) monthCount++;

      if (v.purpose) {
        purposes[v.purpose] = (purposes[v.purpose] || 0) + 1;
      }

      // Robust lookup by email (case-insensitive)
      const visitorEmail = v.visitorEmail?.toLowerCase().trim();
      const userProfile = users?.find(u => u.institutionalEmail?.toLowerCase().trim() === visitorEmail);
      const college = userProfile?.college || 'External/Unknown';
      colleges[college] = (colleges[college] || 0) + 1;
    });

    const purposeData = Object.entries(purposes).map(([name, count]) => ({ name, count }));
    const collegeData = Object.entries(colleges).map(([name, value], idx) => ({ 
      name, 
      value, 
      color: ['#DEB731', '#ED7D58', '#72b0ab', '#fe9179', '#bcdddc'][idx % 5] 
    }));

    const sortedVisits = [...visits].sort((a, b) => {
      const tA = a.entryTime?.toDate ? a.entryTime.toDate().getTime() : 0;
      const tB = b.entryTime?.toDate ? b.entryTime.toDate().getTime() : 0;
      return tB - tA;
    });

    return {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      purposeData,
      collegeData,
      recent: sortedVisits.slice(0, 5)
    };
  }, [visits, users]);

  const exportToCSV = () => {
    if (!visits || visits.length === 0) return;
    
    const headers = ["Visitor Email", "College", "Purpose", "Entry Time"];
    const rows = visits.map(v => {
      const userProfile = users?.find(u => u.institutionalEmail?.toLowerCase() === v.visitorEmail?.toLowerCase());
      return [
        v.visitorEmail,
        userProfile?.college || "N/A",
        v.purpose,
        v.entryTime?.toDate ? format(v.entryTime.toDate(), 'PPP p') : 'N/A'
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEU_Library_Full_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isVisitsLoading || isUsersLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold italic">Synchronizing Library Records...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground font-headline">Library Dashboard</h1>
            <p className="text-muted-foreground italic">New Era University Real-time Analytics</p>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white font-bold h-11"
          >
            <FileDown className="mr-2 w-4 h-4" /> Export Full Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Footfall</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">{stats.today}</div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Visitors since midnight</p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weekly Total</CardTitle>
              <Calendar className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">{stats.week}</div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Active this week</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly Archive</CardTitle>
              <Clock className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">{stats.month}</div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Total monthly records</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-headline">Traffic by College</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                {stats.collegeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.collegeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.collegeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1608', border: '1px solid #DEB731', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '10px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                    Awaiting sufficient data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-headline">Purpose Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                {stats.purposeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.purposeData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{ backgroundColor: '#1A1608', border: '1px solid #DEB731', borderRadius: '12px' }}
                      />
                      <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={30}>
                        {stats.purposeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#DEB731' : '#ED7D58'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                    Awaiting sufficient data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl border-muted/20 overflow-hidden">
          <CardHeader className="bg-secondary/20 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-bold font-headline">Latest Entries</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs" asChild>
              <Link href="/admin/visitor-log">View All Records</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow className="border-none">
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6">Visitor Email</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Entry Time</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right px-6">Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">No visits recorded today.</TableCell>
                  </TableRow>
                ) : (
                  stats.recent?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-muted/10">
                      <TableCell className="font-bold px-6">{log.visitorEmail}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{log.entryTime?.toDate ? format(log.entryTime.toDate(), 'p') : '...'}</TableCell>
                      <TableCell className="text-right px-6">
                        <Badge variant="outline" className="border-accent/30 text-accent uppercase text-[9px] font-black">{log.purpose}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}