import { useState, useEffect } from 'react';
import { EventCard } from '@/features/events/components/EventCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
  '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem
} from
  '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Loader2
} from
  'lucide-react';
import { CreateEventModal } from '@/features/events/components/CreateEventModal';
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: number;
  category: string;
  image?: string;
  status: string;
}

export function EventsPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('visibility', '==', 'public'),
      where('status', 'in', ['published', 'ongoing', 'completed'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedDate = 'TBD';
        try {
          if (data.date) {
            formattedDate = format(new Date(data.date), 'MMM d, yyyy');
          }
        } catch (e) {
          console.error('Date parse error:', e);
        }
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          date: formattedDate,
          location: data.locationName || 'Unknown Location',
          participants: data.participantsCount || 0,
          category: data.category || 'Other',
          image: data.coverImage,
          status: data.status || 'published',
        };
      });
      setEvents(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and join environmental events in Zamboanga.
          </p>
        </div>
        {(role === 'organizer' || role === 'admin') &&
          <CreateEventModal trigger={
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200/50 font-semibold border-none gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          } />
        }
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
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
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as 'grid' | 'list')}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
            <LayoutGrid className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="px-3">
            <List className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading environmental events...</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((e, i) => (
            <EventCard key={e.id} event={e} view="grid" index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, i) => (
            <EventCard key={e.id} event={e} view="list" index={i} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No events found matching your search.</p>
        </div>
      )}
    </div>
  );
}
