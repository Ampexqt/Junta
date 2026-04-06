import { useState } from 'react';
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
  Waves,
  TreePine,
  BookOpen,
  Flower2
} from
  'lucide-react';
import { CreateEventModal } from '@/features/events/components/CreateEventModal';
import { useAuth } from '@/features/auth/AuthContext';

const events = [
  {
    id: 1,
    title: 'Sta. Cruz Beach Cleanup Drive',
    date: 'Jan 15, 2025',
    location: 'Great Sta. Cruz Island',
    participants: 45,
    category: 'Cleanup',
    icon: Waves
  },
  {
    id: 2,
    title: 'Mangrove Planting Initiative',
    date: 'Jan 22, 2025',
    location: 'Sinunuc Mangrove Area',
    participants: 32,
    category: 'Planting',
    icon: TreePine
  },
  {
    id: 3,
    title: 'Marine Biodiversity Workshop',
    date: 'Feb 3, 2025',
    location: 'Zamboanga City Hall',
    participants: 28,
    category: 'Workshop',
    icon: BookOpen
  },
  {
    id: 4,
    title: 'Paseo del Mar Awareness Walk',
    date: 'Feb 10, 2025',
    location: 'Paseo del Mar',
    participants: 60,
    category: 'Awareness',
    icon: Flower2
  },
  {
    id: 5,
    title: 'Pasonanca Park Reforestation',
    date: 'Mar 1, 2025',
    location: 'Pasonanca Natural Park',
    participants: 25,
    category: 'Planting',
    icon: TreePine
  },
  {
    id: 6,
    title: 'Rio Hondo Coastline Cleanup',
    date: 'Mar 15, 2025',
    location: 'Rio Hondo Area',
    participants: 50,
    category: 'Cleanup',
    icon: Waves
  },
  {
    id: 7,
    title: 'Ecological Leadership Camp',
    date: 'Apr 5, 2025',
    location: 'Zamboanga Eco-Park',
    participants: 40,
    category: 'Workshop',
    icon: BookOpen
  },
  {
    id: 8,
    title: 'Urban Community Garden',
    date: 'Apr 20, 2025',
    location: 'Barangay Tetuan',
    participants: 20,
    category: 'Planting',
    icon: Flower2
  }
];

export function EventsPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

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
            <Button className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
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

      {view === 'grid' ? (
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

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No events found matching your search.</p>
        </div>
      )}
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
