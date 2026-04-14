import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from
  '@/components/ui/dialog';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Eye,
  CalendarDays,
  MapPin,
  Users,
  Tag,
  Loader2,
  Clock,
  ExternalLink,
  FileText,
  Trash2,
  Plus,
  X,
  FileDown
} from
  'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { format } from 'date-fns';
import { sileo } from 'sileo';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
type PendingEvent = {
  id: string;
  title: string;
  organizerName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  locationName: string;
  category: string;
  aboutEvent: string;
  shortDescription: string;
  status: string;
  organizationName?: string;
  coverImage?: string;
  timeline?: { id: string; time: string; activity: string; description: string; }[];
  requirements?: string[];
  documents?: { id: string; name: string; url: string; }[];
};

const categoryBadge: Record<string, string> = {
  Research: 'bg-cyan-50 text-cyan-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700'
};
const statusBadge: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700'
};
export function EventApprovalsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: 'published' | 'rejected';
    id: string;
    reason: string;
  }>({ open: false, type: 'published', id: '', reason: '' });

  const fetchPendingEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Fetch error:', err);
      sileo.error({ title: 'Fetch Error', description: 'Could not load pending events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const pending = events.filter((e) => e.status === 'pending').length;
  // Note: Approved mapping to 'published' for backend consistency
  const approved = events.filter((e) => e.status === 'published').length;
  const rejected = events.filter((e) => e.status === 'rejected').length;

  const handleAction = async (id: string, action: 'published' | 'rejected') => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ 
          status: action
        })
      });

      if (!response.ok) throw new Error('Action failed');
      
      // If rejected, we might want to store the reason in the future, 
      // but for now we just log it or pass it if the API supports it
      console.log(`Action: ${action}, Reason: ${confirmAction.reason}`);

      sileo.success({ 
        title: action === 'published' ? 'Event Approved' : 'Event Rejected', 
        description: `The event has been successfully ${action}.` 
      });

      // Update local state and close dialogs
      setEvents(prev => prev.filter(e => e.id !== id));
      setDialogOpen(false);
      setConfirmAction(prev => ({ ...prev, open: false, reason: '' }));
    } catch (err) {
      console.error('Action error:', err);
      sileo.error({ title: 'Error', description: 'Failed to update event status.' });
    } finally {
      setActionLoading(null);
    }
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
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">
            Event Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Review and manage submitted event requests.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-primary tracking-tight">{pending} Pending Requests</span>
        </div>
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
                            {(e.organizerName || 'A').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {e.organizerName || 'Anonymous'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                            {e.organizationName || 'No Organization'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {e.date ? (
                            (() => {
                                try {
                                    return format(new Date(e.date), 'MMM dd, yyyy');
                                } catch (e) {
                                    return 'Invalid Date';
                                }
                            })()
                        ) : 'TBD'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {e.locationName || 'TBD'}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all rounded-lg gap-2"
                        onClick={() => {
                          setSelectedEvent(e);
                          setDialogOpen(true);
                        }}>
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Button>
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
          <DialogContent className="sm:max-w-2xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-slate-50 flex flex-col">
            {/* Header Area */}
            <DialogHeader className="p-6 bg-white border-b border-slate-100 flex flex-row items-start justify-between space-y-0 flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                      {selectedEvent.category}
                   </Badge>
                   <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-widest border-0 ${statusBadge[selectedEvent.status]}`}>
                      {selectedEvent.status}
                   </Badge>
                </div>
                <DialogTitle className="text-xl font-black text-slate-900 leading-tight">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400">
                  Organized by <span className="text-slate-600 font-bold">{selectedEvent.organizerName || 'Anonymous'}</span>
                </DialogDescription>
              </div>

              <div className="flex-1 max-w-[240px] ml-auto mr-8">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest px-1">Organization Label</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                   <Tag className="w-3.5 h-3.5 text-slate-400" />
                   <span className="text-[13px] font-bold text-slate-900">{selectedEvent.organizationName || 'No Organization'}</span>
                </div>
              </div>
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
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-3">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-slate-200" /> Executive Summary
                        </h3>
                        <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            {selectedEvent.aboutEvent || 'No detailed description provided.'}
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
                                    <span className="text-[11px] font-bold">{selectedEvent.date ? format(new Date(selectedEvent.date), 'MMM dd, yyyy') : 'TBD'}</span>
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

                <div className="grid grid-cols-2 gap-8">
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
                                            {idx !== selectedEvent.timeline!.length - 1 && <div className="w-[1px] flex-1 bg-slate-200 my-1" />}
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
                                            href={doc.url} 
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

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                {selectedEvent.status === 'pending' && (
                    <>
                        <Button
                            variant="ghost"
                            disabled={actionLoading === selectedEvent.id}
                            className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest px-6"
                            onClick={() => setConfirmAction({ open: true, type: 'rejected', id: selectedEvent.id, reason: '' })}
                        >
                            {actionLoading === selectedEvent.id ? 'Loading...' : 'Decline Request'}
                        </Button>
                        <Button
                            disabled={actionLoading === selectedEvent.id}
                            className="bg-slate-900 hover:bg-black text-white px-8 h-11 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
                            onClick={() => setConfirmAction({ open: true, type: 'published', id: selectedEvent.id, reason: '' })}
                        >
                            {actionLoading === selectedEvent.id ? 'Approving...' : 'Publish Event'}
                        </Button>
                    </>
                )}
            </div>
          </DialogContent>
        }
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={confirmAction.open} onOpenChange={(open) => setConfirmAction(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
               {confirmAction.type === 'published' ? 'Final Confirmation' : 'Decline Request'}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 pt-2">
               {confirmAction.type === 'published' 
                 ? 'Are you absolutely sure about this? Did you read the attached documentation and activity timeline thoroughly?' 
                 : 'Please provide a reason why this event request is being declined. This helps organizers improve their submissions.'}
            </DialogDescription>
          </DialogHeader>

          {confirmAction.type === 'rejected' && (
            <div className="py-4">
              <textarea 
                className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                placeholder="Type your explanation here..."
                value={confirmAction.reason}
                onChange={(e) => setConfirmAction(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
             <Button
                variant="ghost"
                className="font-bold text-xs uppercase tracking-widest text-slate-400"
                onClick={() => setConfirmAction(prev => ({ ...prev, open: false }))}
             >
                Cancel
             </Button>
             <Button
                disabled={confirmAction.type === 'rejected' && !confirmAction.reason.trim()}
                className={confirmAction.type === 'published' 
                  ? "bg-slate-900 hover:bg-black text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  : "bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                }
                onClick={() => handleAction(confirmAction.id, confirmAction.type)}
             >
                {confirmAction.type === 'published' ? 'Yes, Publish event' : 'Confirm Decline'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>);

}
