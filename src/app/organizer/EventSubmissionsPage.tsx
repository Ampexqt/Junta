import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from
  '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
import { FileCheck, CheckCircle, Clock, XCircle, Eye, Edit } from 'lucide-react';
type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
const submissions = [
  {
    id: 1,
    name: 'Sta. Cruz Beach Cleanup Drive',
    date: 'Jan 15, 2025',
    category: 'Cleanup',
    status: 'Approved' as SubmissionStatus,
    submitted: 'Dec 20, 2024'
  },
  {
    id: 2,
    name: 'Mangrove Planting Initiative',
    date: 'Jan 22, 2025',
    category: 'Planting',
    status: 'Approved' as SubmissionStatus,
    submitted: 'Dec 22, 2024'
  },
  {
    id: 3,
    name: 'Marine Biodiversity Workshop',
    date: 'Feb 3, 2025',
    category: 'Workshop',
    status: 'Approved' as SubmissionStatus,
    submitted: 'Jan 5, 2025'
  },
  {
    id: 4,
    name: 'Coral Reef Monitoring',
    date: 'Mar 1, 2025',
    category: 'Research',
    status: 'Approved' as SubmissionStatus,
    submitted: 'Jan 10, 2025'
  },
  {
    id: 5,
    name: 'Youth Eco-Leadership Camp',
    date: 'Mar 8, 2025',
    category: 'Workshop',
    status: 'Approved' as SubmissionStatus,
    submitted: 'Jan 12, 2025'
  },
  {
    id: 6,
    name: 'Wetland Bird Watching Day',
    date: 'Mar 20, 2025',
    category: 'Awareness',
    status: 'Pending' as SubmissionStatus,
    submitted: 'Jan 14, 2025'
  },
  {
    id: 7,
    name: 'School Recycling Drive',
    date: 'Mar 25, 2025',
    category: 'Cleanup',
    status: 'Pending' as SubmissionStatus,
    submitted: 'Jan 15, 2025'
  },
  {
    id: 8,
    name: 'River Cleanup Initiative',
    date: 'Feb 15, 2025',
    category: 'Cleanup',
    status: 'Rejected' as SubmissionStatus,
    submitted: 'Jan 2, 2025'
  }];

const statusStyles: Record<SubmissionStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700'
};
const categoryStyles: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700'
};
export function EventSubmissionsPage() {
  const navigate = useNavigate();
  const total = submissions.length;
  const approved = submissions.filter((s) => s.status === 'Approved').length;
  const pending = submissions.filter((s) => s.status === 'Pending').length;
  const rejected = submissions.filter((s) => s.status === 'Rejected').length;
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-6">

      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Event Submissions
        </h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your submitted events.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: FileCheck,
            label: 'Total Submitted',
            value: total,
            color: 'bg-primary/10 text-primary'
          },
          {
            icon: CheckCircle,
            label: 'Approved',
            value: approved,
            color: 'bg-green-50 text-green-600'
          },
          {
            icon: Clock,
            label: 'Pending',
            value: pending,
            color: 'bg-amber-50 text-amber-600'
          },
          {
            icon: XCircle,
            label: 'Rejected',
            value: rejected,
            color: 'bg-red-50 text-red-600'
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
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              All Submissions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Submitted
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) =>
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {s.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {s.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${categoryStyles[s.category] || ''}`}>

                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${statusStyles[s.status]}`}>

                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {s.submitted}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => navigate(`/app/events/${s.id}`)}>

                          <Eye className="w-4 h-4" />
                        </Button>
                        {s.status === 'Rejected' &&
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-amber-600 hover:bg-amber-50">

                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>);

}
