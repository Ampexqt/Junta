import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  CalendarDays,
  Users,
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { useMapboxToken } from '@/hooks/useMapboxToken';

interface EventPin {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  participants: number;
  lat: number;
  lng: number;
}

const categoryColors: Record<string, string> = {
  Cleanup: '#3b82f6',
  Planting: '#22c55e',
  Workshop: '#a855f7',
  Awareness: '#f59e0b',
  Research: '#06b6d4',
};
const categoryBadge: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700',
};

export function MapViewPage() {
  const navigate = useNavigate();
  const { token } = useMapboxToken();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pins, setPins] = useState<EventPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('visibility', '==', 'public'),
      where('status', '==', 'published')
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
          category: data.category || 'Other',
          participants: data.participantsCount || 0,
          lat: data.coordinates?.lat || 0,
          lng: data.coordinates?.lng || 0,
        };
      });
      setPins(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const selectedPin = pins.find((p) => p.id === selected);
  const filtered = pins.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  const handlePinSelect = (id: string) => {
    setSelected(id);
    const pin = pins.find(p => p.id === id);
    if (pin && mapRef.current) {
      mapRef.current.flyTo({
        center: [pin.lng, pin.lat],
        zoom: 14,
        duration: 1500
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Map View
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore environmental events across Zamboanga.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <Card className="rounded-2xl shadow-sm border lg:w-[340px] flex-shrink-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-600" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Fetching Events</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">No Events Found</p>
                </div>
              ) : (
                filtered.map((pin) => (
                  <Button
                    asChild
                    variant="ghost"
                    key={pin.id}
                    onClick={() => handlePinSelect(pin.id)}
                    className={`w-full h-auto text-left p-3 rounded-xl transition-all cursor-pointer block group ${
                      selected === pin.id
                        ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200 shadow-sm'
                        : 'hover:bg-slate-50 border-transparent border border-slate-100 hover:border-slate-200 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-transform ${selected === pin.id ? 'scale-125' : 'group-hover:scale-110'}`}
                          style={{ 
                            backgroundColor: categoryColors[pin.category] || '#10b981',
                            boxShadow: `0 0 8px ${categoryColors[pin.category] || '#10b981'}80`
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate transition-colors ${selected === pin.id ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                            {pin.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 mb-1.5">
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 border-0 font-black uppercase tracking-widest ${categoryBadge[pin.category] || 'bg-slate-100 text-slate-600'}`}
                            >
                              {pin.category}
                            </Badge>
                            <span className="text-[10px] font-medium text-slate-500">
                              {pin.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{pin.location}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Map */}
        <Card className="rounded-2xl shadow-sm border flex-1 overflow-hidden relative bg-slate-50 flex items-center justify-center">
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.03)] pointer-events-none z-20" />
          {token ? (
            <div className="w-full h-full relative" style={{ filter: 'contrast(1.1) saturate(1.2) brightness(1.02)' }}>
              <Map
                ref={mapRef}
                initialViewState={{
                  latitude: 6.9150,
                  longitude: 122.0650,
                  zoom: 12.5,
                  pitch: 0,
                  bearing: 0
                }}
                mapStyle="mapbox://styles/mapbox/standard"
                mapboxAccessToken={token}
                style={{ width: '100%', height: '100%' }}
                scrollZoom={true}
                dragPan={true}
              >
                <NavigationControl position="top-left" showCompass={false} />

                {/* Markers */}
                {pins.map((pin) => {
                  const hexColor = categoryColors[pin.category] || '#10b981';
                  const isPinSelected = selected === pin.id;
                  
                  return (
                    <Marker
                      key={pin.id}
                      latitude={pin.lat}
                      longitude={pin.lng}
                      onClick={(e: unknown) => {
                        const event = e as { originalEvent?: Event };
                        if (event?.originalEvent) {
                          event.originalEvent.stopPropagation();
                        }
                        setSelected(pin.id);
                      }}
                    >
                      <div className="relative flex items-center justify-center cursor-pointer group">
                        <div 
                          className={`absolute rounded-full animate-ping ${isPinSelected ? 'w-10 h-10' : 'w-6 h-6 group-hover:w-8 group-hover:h-8'}`} 
                          style={{ backgroundColor: `${hexColor}60` }}
                        />
                        <div 
                          className={`relative rounded-full border-[2.5px] border-white transition-all shadow-[0_0_12px_rgba(0,0,0,0.3)] ${isPinSelected ? 'w-5 h-5 scale-110' : 'w-4 h-4 group-hover:scale-125'}`}
                          style={{ 
                            backgroundColor: hexColor,
                            boxShadow: `0 0 10px ${hexColor}` 
                          }} 
                        />
                      </div>
                    </Marker>
                  );
                })}

                {/* Popup */}
                {selectedPin && (
                  <Popup
                    latitude={selectedPin.lat}
                    longitude={selectedPin.lng}
                    onClose={() => setSelected(null)}
                    closeButton={true}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={15}
                    className="junta-mapbox-premium-popup z-[60]"
                  >
                    <div className="p-2 min-w-[220px]">
                      <div className="flex items-start justify-between mb-2">
                         <Badge
                            variant="secondary"
                            className={`text-[9px] px-2 py-0 border-0 font-black uppercase tracking-widest ${categoryBadge[selectedPin.category] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {selectedPin.category}
                          </Badge>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug mb-3 line-clamp-2">
                        {selectedPin.title}
                      </h3>
                      <div className="space-y-1.5 text-xs font-medium text-slate-500">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                          {selectedPin.date}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[170px]">{selectedPin.location}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {selectedPin.participants} participants
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/app/events/${selectedPin?.id}`)}
                        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-lg shadow-md shadow-emerald-600/20 group/btn transition-all"
                      >
                        View Details 
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </Popup>
                )}
              </Map>
              {/* Aesthetic Gradient "Shadow" for Depth */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none z-10" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Initializing Map Engine...</p>
            </div>
          )}

          {/* City label overlay */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm pointer-events-none">
            Zamboanga City, Philippines
          </div>
        </Card>
      </div>
    </div>
  );
}
