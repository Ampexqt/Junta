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
} from '@/components/ui/table';
import { Eye, MapPin, Users, CalendarDays, Plus, FolderOpen, Loader2 } from 'lucide-react';
import { CreateEventModal } from '../../features/events/components/CreateEventModal';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface EventItem {
  id: string;
  name?: string;
  title?: string;
  date: string;
  location: string;
  participantsCount?: number;
  status: string;
}

export function OrganizerMyEventsPage() {
  const navigate = useNavigate();
  const [approvedEvents, setApprovedEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        // Only show approved/published events here
        const approved = data.filter((e: EventItem) => e.status === 'published');
        setApprovedEvents(approved);
      } catch (error) {
        console.error('Error fetching my events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            My Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Your approved and active events.
          </p>
        </div>
        <CreateEventModal
          trigger={
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200/50 font-semibold border-none transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          }
        />


      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Approved Events
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-0 text-xs">

              {approvedEvents.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm font-medium text-muted-foreground">Loading your events...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : approvedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">No approved events yet</p>
                        <p className="text-xs text-muted-foreground/60">Create an event to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : approvedEvents.map((e) =>
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/events/${e.id}`)}>

                    <TableCell>
                      <p className="font-medium text-sm">{e.name || e.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {e.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {e.date}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {e.participantsCount || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
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
