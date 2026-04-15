import { useState, useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/mapbox';
import { useMapboxToken } from '@/hooks/useMapboxToken';

// Custom colored SVG marker creator for Mapbox
function createColoredIcon(color: string, isSelected = false) {
  const size = isSelected ? 14 : 11;
  return (
    <div style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        {isSelected && <circle cx="12" cy="12" r="11" fill={color} opacity="0.25"/>}
        <circle cx="12" cy="12" r={size / 2 + 2} fill="white" opacity="0.9"/>
        <circle cx="12" cy="12" r={size / 2} fill={color}/>
      </svg>
    </div>
  );
}

// No longer using L.divIcon

const pins = [
  {
    id: 1,
    title: 'Sta. Cruz Beach Cleanup',
    date: 'Jan 15, 2025',
    location: 'Great Sta. Cruz Island',
    category: 'Cleanup',
    participants: 45,
    lat: 6.9447,
    lng: 122.0033,
  },
  {
    id: 2,
    title: 'Mangrove Planting Initiative',
    date: 'Jan 22, 2025',
    location: 'Sinunuc Mangrove Area',
    category: 'Planting',
    participants: 32,
    lat: 6.9211,
    lng: 121.9687,
  },
  {
    id: 3,
    title: 'Marine Biodiversity Workshop',
    date: 'Feb 3, 2025',
    location: 'Zamboanga City Hall',
    category: 'Workshop',
    participants: 28,
    lat: 6.9112,
    lng: 122.0716,
  },
  {
    id: 4,
    title: 'Paseo del Mar Awareness Walk',
    date: 'Feb 10, 2025',
    location: 'Paseo del Mar',
    category: 'Awareness',
    participants: 60,
    lat: 6.9062,
    lng: 122.0785,
  },
  {
    id: 5,
    title: 'Pasonanca Reforestation',
    date: 'Feb 18, 2025',
    location: 'Pasonanca Natural Park',
    category: 'Planting',
    participants: 50,
    lat: 6.9335,
    lng: 122.0421,
  },
  {
    id: 6,
    title: 'Coastal Water Testing',
    date: 'Mar 1, 2025',
    location: 'Rio Hondo Coastline',
    category: 'Research',
    participants: 15,
    lat: 6.8996,
    lng: 122.0601,
  },
];

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

// Helper components removed as they are integrated into the main component logic

export function MapViewPage() {
  const navigate = useNavigate();
  const { token } = useMapboxToken();
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const mapRef = useRef<MapRef>(null);
  const selectedPin = pins.find((p) => p.id === selected);
  const filtered = pins.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  const handlePinSelect = (id: number) => {
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
              {filtered.map((pin) => (
                <Button
                  asChild
                  variant="ghost"
                  key={pin.id}
                  onClick={() => handlePinSelect(pin.id)}
                  className={`w-full h-auto text-left p-3 rounded-xl transition-all cursor-pointer block ${
                    selected === pin.id
                      ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20'
                      : 'hover:bg-muted border-transparent'
                  }`}
                >
                  <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: categoryColors[pin.category] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {pin.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {pin.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] border-0 ${categoryBadge[pin.category]}`}
                        >
                          {pin.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {pin.date}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Map */}
        <Card className="rounded-2xl shadow-sm border flex-1 overflow-hidden relative bg-muted/20 flex items-center justify-center">
          {token ? (
            <Map
              ref={mapRef}
              initialViewState={{
                latitude: 6.9214,
                longitude: 122.0390,
                zoom: 12
              }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={token}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Markers */}
              {pins.map((pin) => (
                <Marker
                  key={pin.id}
                  latitude={pin.lat}
                  longitude={pin.lng}
                  onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(pin.id);
                }}
                >
                  {createColoredIcon(
                    categoryColors[pin.category],
                    selected === pin.id
                  )}
                </Marker>
              ))}

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
                  className="junta-mapbox-popup"
                >
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-start justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryBadge[selectedPin.category]}`}
                      >
                        {selectedPin.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 leading-snug mb-2 font-heading">
                      {selectedPin.title}
                    </h3>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3 text-emerald-600" />
                        {selectedPin.date}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {selectedPin.location}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-emerald-600" />
                        {selectedPin.participants} participants
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/app/events/${selectedPin.id}`)}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200/50"
                      size="sm"
                    >
                      View Details <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </div>
                </Popup>
              )}
            </Map>
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
