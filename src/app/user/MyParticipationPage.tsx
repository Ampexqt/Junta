import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/ui/StarRating';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Trophy,
  Eye,
  Loader2,
  FolderOpen,
  Zap,
  Star
} from 'lucide-react';
import { useMyParticipations, type ParticipationRecord } from '@/hooks/useMyParticipations';
import { format } from 'date-fns';
import { sileo } from 'sileo';
import { RateEventModal } from '@/features/events/components/RateEventModal';

const statusConfig: Record<string, { label: string; className: string }> = {
  Upcoming:  { label: 'Upcoming',   className: 'bg-blue-50 text-blue-700' },
  Ongoing:   { label: 'Ongoing',    className: 'bg-amber-50 text-amber-700' },
  Completed: { label: 'Completed',  className: 'bg-emerald-50 text-emerald-700' },
  Cancelled: { label: 'Cancelled',  className: 'bg-slate-100 text-slate-500' },
};

export function MyParticipationPage() {
  const navigate = useNavigate();
  const { participations, isLoading, error, stats } = useMyParticipations();
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  
  // NOTE: Participants rate the event/organizer. Reusing the modal structure or using a custom RateEventModal in the future.
  const [selectedEventForRating, setSelectedEventForRating] = useState<ParticipationRecord | null>(null);

  const filtered: Record<string, ParticipationRecord[]> = {
    all: participations,
    upcoming: participations.filter(p => p.status === 'Upcoming'),
    ongoing: participations.filter(p => p.status === 'Ongoing'),
    completed: participations.filter(p => p.status === 'Completed'),
  };

  const summaryCards = [
    { icon: CalendarDays, label: 'Total Events', value: stats.total,     color: 'bg-primary/10 text-primary' },
    { icon: CheckCircle,  label: 'Completed',    value: stats.completed, color: 'bg-emerald-50 text-emerald-600' },
    { icon: Zap,          label: 'Ongoing',      value: stats.ongoing,   color: 'bg-amber-50 text-amber-600' },
    { icon: Clock,        label: 'Upcoming',     value: stats.upcoming,  color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">My Participation</h1>
        <p className="text-muted-foreground mt-1 text-sm">Track your environmental event journey in real-time.</p>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 xl:grid-cols-4 gap-3"
      >
        {summaryCards.map(s => (
          <Card key={s.label} className="rounded-2xl shadow-sm border">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.08em]">{s.label}</p>
                  <p className="text-2xl font-heading font-semibold text-foreground mt-0.5">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Average Rating Banner */}
      {stats.averageRating > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-900">Your Volunteer Rating</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={Math.round(stats.averageRating)} readonly size="sm" />
              <span className="text-sm font-bold text-amber-700">{stats.averageRating} / 5.0</span>
            </div>
          </div>
          {stats.averageRating >= 4.8 && (
            <Badge className="bg-amber-500 text-white border-0 font-black text-[10px] uppercase tracking-widest">
              🏆 Eco Champion
            </Badge>
          )}
          {stats.averageRating >= 4 && stats.averageRating < 4.8 && (
            <Badge className="bg-emerald-500 text-white border-0 font-black text-[10px] uppercase tracking-widest">
              ⭐ Top Volunteer
            </Badge>
          )}
        </motion.div>
      )}

      {/* Participation Table */}
      <Card className="rounded-2xl shadow-sm border overflow-hidden">
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <CardTitle className="font-heading text-lg flex items-center gap-2">
                 <Star className="w-4 h-4 text-amber-400 fill-amber-300" /> Event History
               </CardTitle>
               <TabsList className="bg-slate-100/70 rounded-xl h-9 p-1 shrink-0 self-start sm:self-auto overflow-x-auto max-w-full justify-start no-scrollbar">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-3">
                    All {participations.length > 0 && <span className="ml-1 font-black text-[9px]">({participations.length})</span>}
                  </TabsTrigger>
                  <TabsTrigger value="ongoing" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm px-3">
                    Ongoing {stats.ongoing > 0 && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black">{stats.ongoing}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-3">
                    Upcoming {stats.upcoming > 0 && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black">{stats.upcoming}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm px-3">
                    Completed {stats.completed > 0 && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black">{stats.completed}</span>}
                  </TabsTrigger>
               </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
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
                        <p className="text-sm font-medium text-muted-foreground">Loading your participations...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-rose-500 font-bold">{error}</TableCell>
                  </TableRow>
                ) : filtered[activeTab].length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">No participations found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered[activeTab].map((p) => {
                    const cfg = statusConfig[p.status] || statusConfig.Upcoming;
                    return (
                      <TableRow key={p.id} className="cursor-pointer group" onClick={() => navigate(`/app/events/${p.eventId}`)}>
                        <TableCell>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">{p.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{p.organizationName || p.organizerName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden mt-1">{p.date ? format(new Date(p.date), 'MMM d, yyyy') : 'TBD'}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{p.date ? format(new Date(p.date), 'MMM d, yyyy') : 'TBD'}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {p.location && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 text-[9px] font-black uppercase tracking-tighter ${cfg.className}`}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            {p.status === 'Completed' && !p.hasRatedEvent && (
                              <Button variant="ghost" size="sm"
                                className="text-xs font-bold text-amber-500 hover:bg-amber-50 h-7 px-2"
                                onClick={(ev) => { ev.stopPropagation(); setSelectedEventForRating(p); }}>
                                <Star className="w-3 h-3 mr-1" /> Rate Event
                              </Button>
                            )}
                            {p.status === 'Completed' && p.hasRatedEvent && (
                               <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200">
                                 <Star className="w-3 h-3 mr-1 fill-amber-400" /> Rated
                               </Badge>
                            )}
                            <Button variant="ghost" size="sm"
                              className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 h-7 px-2"
                              onClick={(ev) => { ev.stopPropagation(); navigate(`/app/events/${p.eventId}`); }}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {selectedEventForRating && (
         <RateEventModal
           eventId={selectedEventForRating.eventId}
           eventName={selectedEventForRating.title}
           isOpen={!!selectedEventForRating}
           onClose={() => setSelectedEventForRating(null)}
           onSuccess={() => sileo.success({ title: 'Event rated successfully!', description: '15 XP earned.' })}
         />
      )}
    </div>
  );
}
