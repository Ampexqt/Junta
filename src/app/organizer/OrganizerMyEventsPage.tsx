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
import { Eye, MapPin, Users, CalendarDays, Plus, FolderOpen, Loader2, Zap, Flag, Star } from 'lucide-react';
import { CreateEventModal } from '../../features/events/components/CreateEventModal';
import { ViewParticipantsModal } from '../../features/events/components/ViewParticipantsModal';
import { RateParticipantsModal } from '../../features/events/components/RateParticipantsModal';
import { ViewEventRatingsModal } from '../../features/events/components/ViewEventRatingsModal';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

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
  const [activeEvents, setActiveEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<EventItem | null>(null);
  const [selectedEventForRating, setSelectedEventForRating] = useState<EventItem | null>(null);
  const [selectedEventForEventRatings, setSelectedEventForEventRatings] = useState<EventItem | null>(null);
  const [lifecycleLoading, setLifecycleLoading] = useState<string | null>(null);

  const handleLifecycle = async (eventId: string, action: 'mark-ongoing' | 'mark-completed') => {
    setLifecycleLoading(eventId + action);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed');
      sileo.success({ title: action === 'mark-ongoing' ? 'Event is now Ongoing!' : 'Event marked as Completed!', description: 'Status updated successfully.' });
      // Refresh list
      fetchMyEvents();
    } catch {
      sileo.error({ title: 'Error', description: 'Failed to update event status.' });
    } finally {
      setLifecycleLoading(null);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/my-events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      // Show published, ongoing, and completed events
      const active = data.filter((e: EventItem) =>
        ['published', 'ongoing', 'completed'].includes(e.status)
      );
      setActiveEvents(active);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

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
            <CardTitle className="font-heading text-lg">My Events</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">
              {activeEvents.length} active
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
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : activeEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">No approved events yet</p>
                        <p className="text-xs text-muted-foreground/60">Create an event to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : activeEvents.map((e) =>
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => navigate(`/app/events/${e.id}`)}>
                    <TableCell>
                      <p className="font-medium text-sm">{e.name || e.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{e.date}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{e.date}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />{e.participantsCount || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 text-[9px] font-black uppercase tracking-tighter ${
                        e.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                        e.status === 'ongoing'   ? 'bg-amber-50 text-amber-700' :
                        e.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {e.status === 'published' ? 'Approved' : e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {/* Lifecycle buttons */}
                        {e.status === 'published' && (
                          <Button variant="ghost" size="sm"
                            className="text-xs font-bold text-amber-600 hover:bg-amber-50 h-7 px-2"
                            disabled={lifecycleLoading === e.id + 'mark-ongoing'}
                            onClick={(ev) => { ev.stopPropagation(); handleLifecycle(e.id, 'mark-ongoing'); }}>
                            <Zap className="w-3 h-3 mr-1" /> Ongoing
                          </Button>
                        )}
                        {(e.status === 'published' || e.status === 'ongoing') && (
                          <Button variant="ghost" size="sm"
                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 h-7 px-2"
                            disabled={lifecycleLoading === e.id + 'mark-completed'}
                            onClick={(ev) => { ev.stopPropagation(); handleLifecycle(e.id, 'mark-completed'); }}>
                            <Flag className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        )}
                        {e.status === 'completed' && (
                          <>
                            <Button variant="ghost" size="sm"
                              className="text-xs font-bold text-amber-500 hover:bg-amber-50 h-7 px-2"
                              onClick={(ev) => { ev.stopPropagation(); setSelectedEventForRating(e); }}>
                              <Star className="w-3 h-3 mr-1" /> Rate Users
                            </Button>
                            <Button variant="ghost" size="sm"
                              className="text-xs font-bold text-indigo-500 hover:bg-indigo-50 h-7 px-2"
                              onClick={(ev) => { ev.stopPropagation(); setSelectedEventForEventRatings(e); }}>
                              <Star className="w-3 h-3 mr-1" /> View Reviews
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm"
                          className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 h-7 px-2"
                          onClick={(ev) => { ev.stopPropagation(); setSelectedEventForParticipants(e); }}>
                          <Users className="w-3.5 h-3.5 mr-1" /> Participants
                        </Button>
                        <Button variant="ghost" size="sm"
                          className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 h-7 px-2"
                          onClick={(ev) => { ev.stopPropagation(); navigate(`/app/events/${e.id}`); }}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
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

      <ViewParticipantsModal
        eventId={selectedEventForParticipants?.id || ''}
        eventName={selectedEventForParticipants?.name || selectedEventForParticipants?.title || ''}
        isOpen={!!selectedEventForParticipants}
        onClose={() => setSelectedEventForParticipants(null)}
      />
      <RateParticipantsModal
        eventId={selectedEventForRating?.id || ''}
        eventName={selectedEventForRating?.name || selectedEventForRating?.title || ''}
        isOpen={!!selectedEventForRating}
        onClose={() => setSelectedEventForRating(null)}
      />
      <ViewEventRatingsModal
        eventId={selectedEventForEventRatings?.id || ''}
        eventName={selectedEventForEventRatings?.name || selectedEventForEventRatings?.title || ''}
        isOpen={!!selectedEventForEventRatings}
        onClose={() => setSelectedEventForEventRatings(null)}
      />
    </motion.div>
  );
}
