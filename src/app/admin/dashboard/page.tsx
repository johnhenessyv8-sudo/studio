
"use client";

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Search, 
  FileDown, 
  Filter 
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const COLLEGE_DATA = [
  { name: 'CICS', value: 145, color: '#72b0ab' },
  { name: 'Education', value: 82, color: '#bcdddc' },
  { name: 'Nursing', value: 120, color: '#ffedd1' },
  { name: 'Arts', value: 65, color: '#fdc1b4' },
  { name: 'Engineering', value: 110, color: '#fe9179' },
  { name: 'Business', value: 95, color: '#cfb97e' },
];

const PURPOSE_DATA = [
  { name: 'Assignment', count: 180 },
  { name: 'Computer', count: 240 },
  { name: 'Researching', count: 120 },
  { name: 'Reading', count: 90 },
  { name: 'Other', count: 40 },
];

const RECENT_LOGS = [
  { name: 'Juan Dela Cruz', id: '20-12345', time: '09:15 AM', program: 'BSIT', purpose: 'Researching' },
  { name: 'Maria Santos', id: '21-54321', time: '09:22 AM', program: 'BSCS', purpose: 'Use of Computer' },
  { name: 'Robert Smith', id: '19-98765', time: '10:05 AM', program: 'BSME', purpose: 'Assignment' },
  { name: 'Elena Gilbert', id: '22-45678', time: '10:30 AM', program: 'BSN', purpose: 'Reading' },
  { name: 'Stefan Salvatore', id: '20-55667', time: '11:15 AM', program: 'BSCE', purpose: 'Assignment' },
];

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of library activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <FileDown className="mr-2 w-4 h-4" /> Export Report
            </Button>
            <div className="flex bg-secondary p-1 rounded-lg">
              <Button size="sm" variant="ghost" className="bg-background shadow-sm">Today</Button>
              <Button size="sm" variant="ghost">7 Days</Button>
              <Button size="sm" variant="ghost">30 Days</Button>
              <Button size="sm" variant="ghost">Custom</Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by visitor name, ID number, college, or purpose..." 
            className="pl-12 h-14 bg-card border-muted focus-visible:ring-primary shadow-xl"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Today</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">124</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" /> +12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">This Week</CardTitle>
              <Calendar className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">842</div>
              <p className="text-xs text-muted-foreground mt-1">Average 120 per day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">This Month</CardTitle>
              <Clock className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">3,150</div>
              <p className="text-xs text-muted-foreground mt-1">On track for target</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Distribution by College</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={COLLEGE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLLEGE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#292518', border: '1px solid #DEB731', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Visitors Purpose Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PURPOSE_DATA}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#292518', border: '1px solid #DEB731', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {PURPOSE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#DEB731' : '#ED7D58'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Visits Log</CardTitle>
            <Button variant="link" className="text-primary font-bold" asChild>
              <Link href="/admin/visitor-log">View All Logs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="font-bold">Visitor Name</TableHead>
                  <TableHead className="font-bold">ID Number</TableHead>
                  <TableHead className="font-bold">Entry Time</TableHead>
                  <TableHead className="font-bold">Program</TableHead>
                  <TableHead className="font-bold">Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_LOGS.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.name}</TableCell>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{log.program}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-accent text-accent">{log.purpose}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
