import { motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserCheck,
  Shield,
  CalendarDays,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X } from
'lucide-react';
const verifications = [
{
  name: 'Maria Santos',
  email: 'maria.santos@email.com',
  idStatus: 'Submitted',
  date: 'Jan 10, 2025',
  initials: 'MS'
},
{
  name: 'Pedro Reyes',
  email: 'pedro.reyes@email.com',
  idStatus: 'Submitted',
  date: 'Jan 11, 2025',
  initials: 'PR'
},
{
  name: 'Ana Garcia',
  email: 'ana.garcia@email.com',
  idStatus: 'Submitted',
  date: 'Jan 12, 2025',
  initials: 'AG'
},
{
  name: 'Carlos Mendoza',
  email: 'carlos.m@email.com',
  idStatus: 'Resubmitted',
  date: 'Jan 12, 2025',
  initials: 'CM'
},
{
  name: 'Sofia Cruz',
  email: 'sofia.cruz@email.com',
  idStatus: 'Submitted',
  date: 'Jan 13, 2025',
  initials: 'SC'
}];

const organizerRequests = [
{
  name: 'Roberto Lim',
  email: 'roberto.lim@email.com',
  reason: 'Leading local beach cleanup group for 3 years',
  date: 'Jan 8, 2025',
  initials: 'RL'
},
{
  name: 'Elena Tan',
  email: 'elena.tan@email.com',
  reason:
  'Environmental Science teacher, wants to organize student activities',
  date: 'Jan 10, 2025',
  initials: 'ET'
}];

const eventApprovals = [
{
  name: 'Coral Reef Survey 2025',
  organizer: 'Roberto Lim',
  date: 'Feb 20, 2025',
  category: 'Research'
},
{
  name: 'Wetland Bird Watching',
  organizer: 'Elena Tan',
  date: 'Mar 5, 2025',
  category: 'Awareness'
},
{
  name: 'School Recycling Drive',
  organizer: 'Maria Santos',
  date: 'Mar 12, 2025',
  category: 'Cleanup'
}];

const categoryBadge: Record<string, string> = {
  Research: 'bg-cyan-50 text-cyan-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700'
};
export function AdminPanelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage verifications, requests, and event approvals.
        </p>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="grid grid-cols-3 gap-4">
        
        {[
        {
          icon: UserCheck,
          label: 'Pending Verifications',
          value: verifications.length,
          color: 'bg-amber-50 text-amber-600'
        },
        {
          icon: Shield,
          label: 'Organizer Requests',
          value: organizerRequests.length,
          color: 'bg-purple-50 text-purple-600'
        },
        {
          icon: CalendarDays,
          label: 'Event Approvals',
          value: eventApprovals.length,
          color: 'bg-blue-50 text-blue-600'
        }].
        map((s) =>
        <Card key={s.label} className="rounded-2xl shadow-sm border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-heading font-semibold text-foreground mt-1">
                    {s.value}
                  </p>
                </div>
                <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <Tabs defaultValue="verification">
        <TabsList>
          <TabsTrigger value="verification" className="gap-1.5">
            User Verification{' '}
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 h-4">
              {verifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="organizer" className="gap-1.5">
            Organizer Requests{' '}
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 h-4">
              {organizerRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            Event Approvals{' '}
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 h-4">
              {eventApprovals.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="mt-4">
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead>ID Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Submitted
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifications.map((v) =>
                    <TableRow key={v.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {v.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{v.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {v.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {v.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                          variant="outline"
                          className={`text-xs border-0 ${v.idStatus === 'Resubmitted' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          
                            {v.idStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {v.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                            
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-green-600 hover:text-white hover:bg-green-600 transition-all duration-200">
                            
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 transition-all duration-200">
                            
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizer" className="mt-4">
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Reason
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizerRequests.map((r) =>
                    <TableRow key={r.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-purple-50 text-purple-700 text-xs">
                                {r.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{r.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {r.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {r.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                          {r.reason}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {r.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider h-7 px-3 shadow-sm transition-all duration-200">
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-[10px] font-bold uppercase tracking-wider h-7 px-3 transition-all duration-200">
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Organizer
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventApprovals.map((e) =>
                    <TableRow key={e.name}>
                        <TableCell>
                          <p className="font-medium text-sm">{e.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {e.organizer}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {e.organizer}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {e.date}
                        </TableCell>
                        <TableCell>
                          <Badge
                          variant="outline"
                          className={`text-xs border-0 ${categoryBadge[e.category]}`}>
                          
                            {e.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider h-7 px-3 shadow-sm transition-all duration-200">
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-[10px] font-bold uppercase tracking-wider h-7 px-3 transition-all duration-200">
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

}
