import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Trophy,
  Eye,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

const statusStyles: Record<string, string> = {
  Completed: 'bg-green-50 text-green-700',
  Upcoming: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-amber-50 text-amber-700'
};
export function MyParticipationPage() {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/events/my-participations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch participations');
        
        const data = await response.json();
        setParticipations(data);
      } catch (error) {
        console.error('Error fetching participations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipations();
  }, []);

  const total = participations.length;
  const completed = participations.filter(
    (p) => p.status === 'Completed'
  ).length;
  const upcoming = participations.filter((p) => p.status === 'Upcoming').length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          My Participation
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your environmental event participation and impact.
        </p>
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {[
          {
            icon: CalendarDays,
            label: 'Total Events',
            value: total,
            color: 'bg-primary/10 text-primary'
          },
          {
            icon: CheckCircle,
            label: 'Completed',
            value: completed,
            color: 'bg-green-50 text-green-600'
          },
          {
            icon: Clock,
            label: 'Upcoming',
            value: upcoming,
            color: 'bg-blue-50 text-blue-600'
          }].
          map((s) =>
            <Card key={s.label} className="rounded-2xl shadow-sm border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.08em]">{s.label}</p>
                    <p className="text-2xl font-heading font-semibold text-foreground mt-1">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>

                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </motion.div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Event History
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-medium">{completed} events completed</span>
            </div>
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
                        <p className="text-sm font-medium text-muted-foreground">Loading your participation history...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : participations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">No participations yet</p>
                        <p className="text-xs text-muted-foreground/60">Join an event to start your journey.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : participations.map((p) =>
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/events/${p.eventId}`)}>

                    <TableCell>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {p.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {p.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {p.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${statusStyles[p.status]}`}>

                        {p.status}
                      </Badge>
                      {p.status === 'In Progress' &&
                        <Progress
                          value={p.progress}
                          className="h-1 mt-1.5 w-20" />

                      }
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
    </div>);

}
