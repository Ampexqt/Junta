import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent
} from
  '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
  Tag,
  Loader2,
  Clock,
  ExternalLink,
  FileText
} from
  'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { format } from 'date-fns';
import { sileo } from 'sileo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  organizerPhotoURL?: string;
  organizationName?: string;
  organizationLogo?: string;
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

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PendingEvent[];
      setEvents(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      sileo.error({ title: 'Fetch Error', description: 'Could not load events.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const pending = events.filter((e) => e.status === 'pending').length;
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
      
      sileo.success({ 
        title: action === 'published' ? 'Event Approved' : 'Event Rejected', 
        description: `The event has been successfully ${action}.` 
      });

      // UI is updated by onSnapshot natively
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>

                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      <Card className="rounded-2xl shadow-sm border overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="pending" className="w-full flex-col">
            <div className="px-6 pt-5 pb-0 border-b border-slate-100 space-y-3">
              <h3 className="font-heading font-bold text-lg text-foreground">Event Submissions</h3>
              <TabsList className="bg-slate-100/70 rounded-xl h-9 p-1">
                <TabsTrigger value="pending" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm px-4">
                  Pending
                  {pending > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black">{pending}</span>}
                </TabsTrigger>
                <TabsTrigger value="approved" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm px-4">
                  Approved
                  {approved > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black">{approved}</span>}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm px-4">
                  Rejected
                  {rejected > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black">{rejected}</span>}
                </TabsTrigger>
              </TabsList>
            </div>

            {(['pending', 'approved', 'rejected'] as const).map(tab => {
              const filtered = events.filter(e =>
                tab === 'approved' ? e.status === 'published' : e.status === tab
              );
              const emptyMsg = tab === 'pending' ? 'No pending events to review.' : tab === 'approved' ? 'No approved events yet.' : 'No rejected events.';
              return (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-100">
                          <TableHead>Event Title</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="hidden lg:table-cell">Location</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground font-medium">
                              {emptyMsg}
                            </TableCell>
                          </TableRow>
                        ) : filtered.map((e) =>
                          <TableRow key={e.id} className="group hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium">{e.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={e.organizationLogo || e.organizerPhotoURL} className="object-cover" />
                                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                    {(e.organizerName || 'A').split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-900">{e.organizerName || 'Anonymous'}</span>
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{e.organizationName || 'No Organization'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {e.date ? (() => { try { return format(new Date(e.date), 'MMM dd, yyyy'); } catch { return 'Invalid Date'; } })() : 'TBD'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{e.locationName || 'TBD'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${categoryBadge[e.category] || 'bg-slate-100 text-slate-600'}`}>
                                {e.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${statusBadge[e.status] || 'bg-slate-100 text-slate-600'}`}>
                                {e.status === 'published' ? 'Approved' : e.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 ml-auto"
                                onClick={() => { setSelectedEvent(e); setDialogOpen(true); }}>
                                View Details <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedEvent &&
          <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-slate-50 flex flex-col">
            {/* Header Area */}
            <DialogHeader className="p-5 sm:p-6 bg-white border-b border-slate-100 flex flex-col lg:flex-row items-start justify-between space-y-3 lg:space-y-0 flex-shrink-0">
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

              <div className="flex-1 w-full lg:max-w-[240px] lg:ml-auto lg:mr-8">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="col-span-1 lg:col-span-2 space-y-3">
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

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 flex-shrink-0">
                {selectedEvent.status === 'pending' && (
                    <>
                        <Button
                            variant="ghost"
                            disabled={actionLoading === selectedEvent.id}
                            className="w-full sm:w-auto text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest px-6"
                            onClick={() => setConfirmAction({ open: true, type: 'rejected', id: selectedEvent.id, reason: '' })}
                        >
                            {actionLoading === selectedEvent.id ? 'Loading...' : 'Decline Request'}
                        </Button>
                        <Button
                            disabled={actionLoading === selectedEvent.id}
                            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 h-11 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
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
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-5 sm:p-6">
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
              <Textarea 
                className="h-32 resize-none"
                placeholder="Type your explanation here..."
                value={confirmAction.reason}
                onChange={(e) => setConfirmAction(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
             <Button
                variant="ghost"
                className="w-full sm:w-auto font-bold text-xs uppercase tracking-widest text-slate-400"
                onClick={() => setConfirmAction(prev => ({ ...prev, open: false }))}
             >
                Cancel
             </Button>
             <Button
                disabled={confirmAction.type === 'rejected' && !confirmAction.reason.trim()}
                className={confirmAction.type === 'published' 
                  ? "w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  : "w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
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
