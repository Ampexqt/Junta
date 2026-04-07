import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
  '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from
  '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
import { Plus, CalendarDays, Users, Edit, Eye, MapPin } from 'lucide-react';
const events = [
  {
    id: 1,
    name: 'Sta. Cruz Beach Cleanup Drive',
    date: 'Jan 15, 2025',
    status: 'Approved',
    participants: 45,
    category: 'Cleanup'
  },
  {
    id: 2,
    name: 'Mangrove Planting Initiative',
    date: 'Jan 22, 2025',
    status: 'Approved',
    participants: 32,
    category: 'Planting'
  },
  {
    id: 3,
    name: 'Marine Biodiversity Workshop',
    date: 'Feb 3, 2025',
    status: 'Pending',
    participants: 0,
    category: 'Workshop'
  },
  {
    id: 4,
    name: 'Paseo del Mar Awareness Walk',
    date: 'Feb 10, 2025',
    status: 'Pending',
    participants: 0,
    category: 'Awareness'
  },
  {
    id: 5,
    name: 'River Cleanup Initiative',
    date: 'Feb 15, 2025',
    status: 'Rejected',
    participants: 0,
    category: 'Cleanup'
  },
  {
    id: 6,
    name: 'Coral Reef Monitoring',
    date: 'Mar 1, 2025',
    status: 'Approved',
    participants: 15,
    category: 'Research'
  },
  {
    id: 7,
    name: 'Youth Eco-Leadership Camp',
    date: 'Mar 8, 2025',
    status: 'Approved',
    participants: 40,
    category: 'Workshop'
  },
  {
    id: 8,
    name: 'Urban Garden Community Build',
    date: 'Mar 15, 2025',
    status: 'Approved',
    participants: 22,
    category: 'Planting'
  }];

const statusStyles: Record<string, string> = {
  Approved: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Rejected: 'bg-red-50 text-red-700'
};
export function OrganizerPanelPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const approved = events.filter((e) => e.status === 'Approved').length;
  const pending = events.filter((e) => e.status === 'Pending').length;
  const totalParticipants = events.reduce((sum, e) => sum + e.participants, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Organizer Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your environmental events.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Create New Event
              </DialogTitle>
              <DialogDescription>
                Fill in the details to submit your event for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  placeholder="e.g., Beach Cleanup Drive" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="event-desc">Description</Label>
                <Textarea
                  id="event-desc"
                  placeholder="Describe your event..."
                  rows={3} />

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleanup">Cleanup</SelectItem>
                      <SelectItem value="planting">Planting</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" placeholder="Event location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-max">Max Participants</Label>
                  <Input id="event-max" type="number" placeholder="100" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setDialogOpen(false)}>

                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {[
          {
            icon: CalendarDays,
            label: 'Total Events',
            value: events.length,
            color: 'bg-primary/10 text-primary'
          },
          {
            icon: CalendarDays,
            label: 'Approved',
            value: approved,
            color: 'bg-green-50 text-green-600'
          },
          {
            icon: CalendarDays,
            label: 'Pending',
            value: pending,
            color: 'bg-amber-50 text-amber-600'
          },
          {
            icon: Users,
            label: 'Total Participants',
            value: totalParticipants,
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

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">My Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Participants
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) =>
                  <TableRow key={e.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {e.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {e.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${statusStyles[e.status]}`}>

                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {e.participants}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => navigate(`/app/events/${e.id}`)}>

                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Edit className="w-4 h-4" />
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
    </div>);

}
