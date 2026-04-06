import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
'../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
'../../components/ui/dialog';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Eye,
  CalendarDays,
  MapPin,
  Users,
  Tag } from
'lucide-react';
type EventStatus = 'Pending' | 'Approved' | 'Rejected';
type PendingEvent = {
  id: number;
  title: string;
  organizer: string;
  initials: string;
  date: string;
  location: string;
  category: string;
  description: string;
  maxParticipants: number;
  status: EventStatus;
};
const initialEvents: PendingEvent[] = [
{
  id: 1,
  title: 'Coral Reef Survey 2025',
  organizer: 'Roberto Lim',
  initials: 'RL',
  date: 'Feb 20, 2025',
  location: 'Sta. Cruz Island Reef',
  category: 'Research',
  description:
  'A comprehensive survey of coral reef health around Sta. Cruz Island. Volunteers will assist marine biologists in documenting coral species, measuring water quality, and identifying areas of concern.',
  maxParticipants: 20,
  status: 'Pending'
},
{
  id: 2,
  title: 'Wetland Bird Watching Day',
  organizer: 'Elena Tan',
  initials: 'ET',
  date: 'Mar 5, 2025',
  location: 'Zamboanga Wetlands',
  category: 'Awareness',
  description:
  'An educational bird watching event at the Zamboanga wetlands. Participants will learn about local bird species, their habitats, and the importance of wetland conservation.',
  maxParticipants: 30,
  status: 'Pending'
},
{
  id: 3,
  title: 'School Recycling Drive',
  organizer: 'Maria Santos',
  initials: 'MS',
  date: 'Mar 12, 2025',
  location: 'Zamboanga National High School',
  category: 'Cleanup',
  description:
  'A recycling awareness and collection drive targeting schools in the Zamboanga area. Students will learn about proper waste segregation and recycling practices.',
  maxParticipants: 100,
  status: 'Pending'
},
{
  id: 4,
  title: 'Mangrove Nursery Setup',
  organizer: 'Pedro Reyes',
  initials: 'PR',
  date: 'Mar 18, 2025',
  location: 'Sinunuc Coastal Area',
  category: 'Planting',
  description:
  'Setting up a community mangrove nursery to propagate seedlings for future planting activities along the Sinunuc coastline.',
  maxParticipants: 25,
  status: 'Pending'
},
{
  id: 5,
  title: 'Eco-Art Workshop for Kids',
  organizer: 'Ana Garcia',
  initials: 'AG',
  date: 'Mar 25, 2025',
  location: 'Zamboanga City Library',
  category: 'Workshop',
  description:
  'A creative workshop where children create art from recycled materials, learning about environmental conservation through creativity.',
  maxParticipants: 40,
  status: 'Pending'
}];

const categoryBadge: Record<string, string> = {
  Research: 'bg-cyan-50 text-cyan-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700'
};
const statusBadge: Record<EventStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700'
};
export function EventApprovalsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const pending = events.filter((e) => e.status === 'Pending').length;
  const approved = events.filter((e) => e.status === 'Approved').length;
  const rejected = events.filter((e) => e.status === 'Rejected').length;
  const handleAction = (id: number, action: EventStatus) => {
    setEvents((prev) =>
    prev.map((e) =>
    e.id === id ?
    {
      ...e,
      status: action
    } :
    e
    )
    );
    setDialogOpen(false);
  };
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
          Event Approvals
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve submitted events.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
        {
          label: 'Pending',
          value: pending,
          color: 'bg-amber-50 text-amber-600',
          icon: ClipboardCheck
        },
        {
          label: 'Approved Today',
          value: approved,
          color: 'bg-green-50 text-green-600',
          icon: CheckCircle
        },
        {
          label: 'Rejected',
          value: rejected,
          color: 'bg-red-50 text-red-600',
          icon: XCircle
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
          <CardTitle className="font-heading text-lg">Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Location
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) =>
                <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {e.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm hidden sm:inline">
                          {e.organizer}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {e.date}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {e.location}
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${categoryBadge[e.category] || ''}`}>
                      
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${statusBadge[e.status]}`}>
                      
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => {
                          setSelectedEvent(e);
                          setDialogOpen(true);
                        }}>
                        
                          <Eye className="w-4 h-4" />
                        </Button>
                        {e.status === 'Pending' &&
                      <>
                            <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(e.id, 'Approved')}>
                          
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(e.id, 'Rejected')}>
                          
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedEvent &&
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>
                Submitted by {selectedEvent.organizer}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedEvent.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {selectedEvent.date}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedEvent.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-4 h-4 text-primary" />
                  {selectedEvent.category}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  Max {selectedEvent.maxParticipants}
                </div>
              </div>
              <Badge
              variant="outline"
              className={`text-xs border-0 ${statusBadge[selectedEvent.status]}`}>
              
                {selectedEvent.status}
              </Badge>
            </div>
            {selectedEvent.status === 'Pending' &&
          <DialogFooter>
                <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleAction(selectedEvent.id, 'Rejected')}>
              
                  Reject
                </Button>
                <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleAction(selectedEvent.id, 'Approved')}>
              
                  Approve Event
                </Button>
              </DialogFooter>
          }
          </DialogContent>
        }
      </Dialog>
    </motion.div>);

}
