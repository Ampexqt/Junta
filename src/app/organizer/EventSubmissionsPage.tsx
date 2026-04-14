import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { FileCheck, CheckCircle, Clock, XCircle, Eye, Edit } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  published: 'bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tighter text-[9px]',
  rejected: 'bg-rose-50 text-rose-700 font-bold uppercase tracking-tighter text-[9px]'
};

const categoryStyles: Record<string, string> = {
  cleanup: 'bg-blue-50 text-blue-700',
  planting: 'bg-green-50 text-green-700',
  workshop: 'bg-purple-50 text-purple-700',
  awareness: 'bg-amber-50 text-amber-700',
  research: 'bg-cyan-50 text-cyan-700'
};
export function EventSubmissionsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/my-events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const total = events.length;
  const approved = events.filter((s) => s.status === 'published').length;
  const pending = events.filter((s) => s.status === 'pending').length;
  const rejected = events.filter((s) => s.status === 'rejected').length;
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
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Loading submissions...
                        </TableCell>
                    </TableRow>
                ) : events.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                            No events found. Start by creating your first event!
                        </TableCell>
                    </TableRow>
                ) : events.map((s) =>
                  <TableRow key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <p className="font-bold text-[14px] text-slate-900">{s.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium sm:hidden mt-0.5">
                        {s.date ? format(new Date(s.date), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-slate-500 text-[13px] font-medium">
                        {s.date ? format(new Date(s.date), 'MMM dd, yyyy') : 'TBD'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold border-none uppercase tracking-tighter px-2 py-0.5 rounded-lg ${categoryStyles[s.category.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 rounded-lg border-none ${statusStyles[s.status]}`}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-400 text-[12px] font-medium">
                        {s.createdAt ? format(new Date(s.createdAt), 'MMM dd, yyyy') : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-95"
                        onClick={() => navigate(`/app/events/${s.id}`)}>
                        View Details
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
