import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Loader2, Search, ArrowRight, X, CalendarDays, MapPin, Users, Tag, CheckCircle, Clock, ExternalLink, FileText, Zap, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewParticipantsModal } from '../../features/events/components/ViewParticipantsModal';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

const categoryStyles: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700',
};
const statusStyles: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tighter text-[9px]',
  Pending: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Rejected: 'bg-rose-50 text-rose-700 font-bold uppercase tracking-tighter text-[9px]',
  Completed: 'bg-blue-50 text-blue-700 font-bold uppercase tracking-tighter text-[9px]',
};

interface EventData {
  id: string;
  name: string;
  organizer: string;
  organizerPhotoURL?: string;
  organizationName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity?: string;
  category: string;
  status: string;
  participants: number;
  locationName: string;
  description: string;
  coverImage: string;
  createdAt: Date;
  timeline?: { id: string; time: string; activity: string; description: string; }[];
  requirements?: string[];
  documents?: { id: string; name: string; url: string; }[];
}

export function AdminAllEventsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<EventData | null>(null);
  const [lifecycleLoading, setLifecycleLoading] = useState<string | null>(null);

  const handleLifecycle = async (eventId: string, action: 'mark-ongoing' | 'mark-completed') => {
    setLifecycleLoading(eventId + action);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed');
      sileo.success({ title: action === 'mark-ongoing' ? 'Event is now Ongoing!' : 'Event marked as Completed!', description: 'Firestore updated in real-time.' });
    } catch {
      sileo.error({ title: 'Error', description: 'Failed to update event status.' });
    } finally {
      setLifecycleLoading(null);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedDate = 'TBD';
        if (data.date) {
          try {
            formattedDate = format(new Date(data.date), 'MMM dd, yyyy');
          } catch (e) {
            formattedDate = 'Invalid Date';
          }
        }

        let statusDisplay = 'Pending';
        if (data.status === 'published') statusDisplay = 'Approved';
        else if (data.status === 'rejected') statusDisplay = 'Rejected';
        else if (data.status === 'completed') statusDisplay = 'Completed';

        return {
          id: doc.id,
          name: data.title || 'Untitled Event',
          organizer: data.organizerName || 'Anonymous',
          organizerPhotoURL: data.organizerPhotoURL || '',
          organizationName: data.organizationName || '',
          date: formattedDate,
          startTime: data.startTime,
          endTime: data.endTime,
          capacity: data.capacity,
          category: data.category || 'Uncategorized',
          status: statusDisplay,
          participants: data.participantsCount || 0,
          locationName: data.locationName || 'Location TBD',
          description: data.aboutEvent || data.shortDescription || 'No description provided.',
          coverImage: data.coverImage || '',
          createdAt: data.createdAt?.toDate?.() || new Date(0),
          timeline: data.timeline,
          requirements: data.requirements,
          documents: data.documents,
        };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setAllEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching all events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = allEvents.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || e.category === category;
    return matchSearch && matchCat;
  });

  const openEventDetail = (e: EventData) => {
    setSelectedEvent(e);
    setIsModalOpen(true);
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(' ');
    const [rawHours, minutes] = time.split(':').map(Number);
    let hours = rawHours;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">All Events</h1>
        <p className="text-muted-foreground mt-1">Complete event directory.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-0 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events or organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cleanup">Cleanup</SelectItem>
                <SelectItem value="Planting">Planting</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Awareness">Awareness</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Organizer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Participants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground font-medium">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => openEventDetail(e)}
                  >
                    <TableCell className="font-medium text-sm">{e.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{e.organizer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-medium">{e.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${categoryStyles[e.category] || 'bg-slate-50 text-slate-600'}`}
                      >
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-none px-2 py-0.5 rounded-lg ${statusStyles[e.status] || statusStyles.Pending}`}
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                      {e.participants}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {/* Lifecycle controls — only for Approved/Ongoing */}
                        {e.status === 'Approved' && (
                          <Button variant="ghost" size="sm"
                            className="text-xs font-bold text-amber-600 hover:bg-amber-50 h-8 px-2"
                            disabled={lifecycleLoading === e.id + 'mark-ongoing'}
                            onClick={(ev) => { ev.stopPropagation(); handleLifecycle(e.id, 'mark-ongoing'); }}>
                            <Zap className="w-3 h-3 mr-1" /> Ongoing
                          </Button>
                        )}
                        {(e.status === 'Approved' || e.status === 'Ongoing') && (
                          <Button variant="ghost" size="sm"
                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 h-8 px-2"
                            disabled={lifecycleLoading === e.id + 'mark-completed'}
                            onClick={(ev) => { ev.stopPropagation(); handleLifecycle(e.id, 'mark-completed'); }}>
                            <Flag className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="sm"
                          className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 h-8 px-2"
                          onClick={(ev) => { ev.stopPropagation(); setSelectedEventForParticipants(e); }}>
                          <Users className="w-3.5 h-3.5 mr-1" /> Participants
                        </Button>
                        <Button variant="ghost" size="sm"
                          className="h-8 px-3 rounded-xl text-primary font-bold hover:bg-primary/5"
                          onClick={(ev) => { ev.stopPropagation(); openEventDetail(e); }}>
                          View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] sm:max-w-2xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-slate-50 flex flex-col">
          {selectedEvent && (
            <>
              {/* Header Area */}
              <DialogHeader className="p-5 sm:p-6 bg-white border-b border-slate-100 flex flex-col lg:flex-row items-start justify-between space-y-3 lg:space-y-0 flex-shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <Badge className={`border-none px-2 py-0 text-[10px] uppercase font-black tracking-widest ${categoryStyles[selectedEvent.category] || 'bg-slate-50 text-slate-600'}`}>
                        {selectedEvent.category}
                     </Badge>
                     <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-widest border-0 ${statusStyles[selectedEvent.status] || 'bg-slate-50 text-slate-600'}`}>
                        {selectedEvent.status}
                     </Badge>
                  </div>
                  <DialogTitle className="text-xl font-black text-slate-900 leading-tight pr-8">
                    {selectedEvent.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-400">
                    Organized by <span className="text-slate-600 font-bold">{selectedEvent.organizer || 'Anonymous'}</span>
                  </DialogDescription>
                </div>

                <div className="flex-1 w-full lg:max-w-[240px] lg:ml-auto lg:mr-8">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest px-1">Organization Label</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                     <Tag className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-[13px] font-bold text-slate-900">{selectedEvent.organizationName || 'No Organization'}</span>
                  </div>
                </div>

                {/* Close button inside header logic but visually absolute top-right */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-8">
                  {/* Hero / Visual */}
                  {selectedEvent.coverImage && (
                    <div className="relative aspect-[16/6] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={selectedEvent.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    </div>
                  )}

                  {/* About Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                      <div className="col-span-1 lg:col-span-2 space-y-3">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <span className="w-4 h-[1px] bg-slate-200" /> Executive Summary
                          </h3>
                          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                              {selectedEvent.description || 'No detailed description provided.'}
                          </p>
                      </div>
                      <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Event Logistics</h3>
                              <div className="space-y-2.5">
                                  <div className="flex items-center gap-2.5 text-slate-600">
                                      <MapPin className="w-4 h-4 text-emerald-500" />
                                      <span className="text-[11px] font-bold truncate">{selectedEvent.locationName || 'Location TBD'}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-slate-600">
                                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                                      <span className="text-[11px] font-bold">{selectedEvent.date ? selectedEvent.date : 'TBD'}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-slate-600">
                                      <Clock className="w-4 h-4 text-emerald-500" />
                                      <span className="text-[11px] font-bold">{selectedEvent.startTime || '--:--'} - {selectedEvent.endTime || '--:--'}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-slate-600">
                                      <Users className="w-4 h-4 text-emerald-500" />
                                      <span className="text-[11px] font-bold">Capacity: {selectedEvent.capacity || 'Open'}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     {/* Timeline Section */}
                     <div className="space-y-4">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                               Activity Timeline
                          </h3>
                          <div className="space-y-2">
                              {selectedEvent.timeline && selectedEvent.timeline.length > 0 ? (
                                  [...selectedEvent.timeline]
                                      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                                      .map((item, idx) => (
                                      <div key={item.id} className="flex gap-3 group">
                                          <div className="flex flex-col items-center">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                                              {idx !== (selectedEvent.timeline?.length || 0) - 1 && <div className="w-[1px] flex-1 bg-slate-200 my-1" />}
                                          </div>
                                          <div className="pb-4">
                                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight leading-none mb-1">{item.time}</p>
                                              <p className="text-xs font-bold text-slate-900">{item.activity}</p>
                                              <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-xs text-slate-400 italic">No timeline entries provided.</p>
                              )}
                          </div>
                     </div>

                     {/* Requirements & Documents */}
                     <div className="space-y-8">
                          {/* Requirements */}
                          <div className="space-y-4">
                              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Operational Requirements</h3>
                              <div className="space-y-2.5">
                                  {selectedEvent.requirements && selectedEvent.requirements.length > 0 ? (
                                      selectedEvent.requirements.map((req, i) => (
                                          <div key={i} className="flex items-center gap-2.5 group">
                                              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                  <CheckCircle className="w-3 h-3" />
                                              </div>
                                              <span className="text-[12px] text-slate-600 font-bold">{req}</span>
                                          </div>
                                      ))
                                  ) : (
                                      <p className="text-xs text-slate-400 italic">No requirements listed.</p>
                                  )}
                              </div>
                          </div>

                          {/* Documents */}
                          <div className="space-y-4">
                              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Reference Documents</h3>
                              <div className="space-y-2">
                                  {selectedEvent.documents && selectedEvent.documents.length > 0 ? (
                                      selectedEvent.documents.map((doc) => (
                                          <a 
                                              key={doc.id} 
                                              href={(/\.(docx|doc|xlsx|xls|pptx|ppt)$/i.test(doc.url) || /\.(docx|doc|xlsx|xls|pptx|ppt)$/i.test(doc.name || ''))
                                                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`
                                                  : doc.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="block p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between group hover:border-emerald-300 hover:bg-emerald-50/30 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                                          >
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                      <FileText className="w-4 h-4" />
                                                  </div>
                                                  <div className="space-y-0.5">
                                                      <p className="text-[11px] font-bold text-slate-900 truncate max-w-[140px] group-hover:text-emerald-700 transition-colors">{doc.name}</p>
                                                      <p className="text-[9px] text-slate-400 font-black">DOCUMENT • PDF</p>
                                                  </div>
                                              </div>
                                              <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:text-emerald-500">
                                                  <ExternalLink className="w-3.5 h-3.5" />
                                              </div>
                                          </a>
                                      ))
                                  ) : (
                                      <p className="text-xs text-slate-400 italic px-1">No reference documents attached.</p>
                                  )}
                              </div>
                          </div>
                     </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ViewParticipantsModal
        eventId={selectedEventForParticipants?.id || ''}
        eventName={selectedEventForParticipants?.name || ''}
        isOpen={!!selectedEventForParticipants}
        onClose={() => setSelectedEventForParticipants(null)}
      />
    </motion.div>
  );
}
