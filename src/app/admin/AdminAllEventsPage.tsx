import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader
} from
'@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';


const categoryStyles: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700'
};
const statusStyles: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tighter text-[9px]',
  Pending: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Rejected: 'bg-rose-50 text-rose-700 font-bold uppercase tracking-tighter text-[9px]',
  Completed: 'bg-blue-50 text-blue-700 font-bold uppercase tracking-tighter text-[9px]'
};

interface EventData {
  id: string;
  name: string;
  organizer: string;
  date: string;
  category: string;
  status: string;
  participants: number;
  createdAt: Date;
}

export function AdminAllEventsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

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
            date: formattedDate,
            category: data.category || 'Uncategorized',
            status: statusDisplay,
            participants: data.participantsCount || 0,
            createdAt: data.createdAt?.toDate?.() || new Date(0)
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
      
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          All Events
        </h1>
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
                className="pl-10" />
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
                  <TableHead className="hidden sm:table-cell">
                    Organizer
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">
                    Participants
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) =>
                  <TableRow key={e.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-sm">
                      {e.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {e.organizer}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-medium">
                      {e.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-none px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${categoryStyles[e.category]}`}>
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-none px-2 py-0.5 rounded-lg ${statusStyles[e.status]}`}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                      {e.participants}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
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
