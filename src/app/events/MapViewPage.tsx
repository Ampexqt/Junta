import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupercluster from 'use-supercluster';
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
  Loader2,
  X
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
  coverImage?: string;
}

const categoryConfig: Record<string, { color: string; bg: string; text: string; icon: string }> = {
  cleanup: { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', icon: '🧹' },
  planting: { color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '🌱' },
  workshop: { color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', icon: '🎓' },
  seminar: { color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', icon: '🏛️' },
  research: { color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-600', icon: '🧬' },
  other: { color: '#64748b', bg: 'bg-slate-50', text: 'text-slate-600', icon: '📍' },
};

const categoryColors: Record<string, string> = {
  cleanup: '#ef4444',
  planting: '#10b981',
  workshop: '#f59e0b',
  seminar: '#3b82f6',
  research: '#8b5cf6',
  other: '#64748b',
};

const categoryBadge: Record<string, string> = {
  cleanup: 'bg-red-50 text-red-600 border-red-100',
  planting: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  workshop: 'bg-amber-50 text-amber-600 border-amber-100',
  seminar: 'bg-blue-50 text-blue-600 border-blue-100',
  research: 'bg-purple-50 text-purple-600 border-purple-100',
};

export function MapViewPage() {
  const navigate = useNavigate();
  const { token } = useMapboxToken();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pins, setPins] = useState<EventPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapRef>(null);
  
  // Map state for clustering
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom] = useState(12.5);

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
          category: data.category || 'other',
          participants: data.participantsCount || 0,
          lat: Number(data.coordinates?.lat) || Number(data.lat) || 0,
          lng: Number(data.coordinates?.lng) || Number(data.lng) || 0,
          coverImage: data.coverImageUrl || data.coverImage || null,
        };
      }).filter(p => p.lat !== 0 && p.lng !== 0);

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
        zoom: 15,
        duration: 1500
      });
    }
  };

  const points = useMemo(() => {
    return filtered.map(pin => ({
      type: "Feature" as const,
      properties: { cluster: false, pinId: pin.id, category: pin.category },
      geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] as [number, number] }
    }));
  }, [filtered]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds ? bounds : undefined,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });

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

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)] lg:h-[calc(100vh-220px)]">
        {/* Sidebar */}
        <Card className="rounded-2xl shadow-sm border lg:w-[340px] flex-shrink-0 flex flex-col h-[240px] lg:h-full overflow-hidden">
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
                    onMouseEnter={() => setHoveredPin(pin.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    className={`w-full h-auto text-left p-3 rounded-xl transition-all cursor-pointer block group ${
                      selected === pin.id || hoveredPin === pin.id
                        ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200 shadow-sm'
                        : 'hover:bg-slate-50 border-transparent border border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-transform ${selected === pin.id || hoveredPin === pin.id ? 'scale-125' : 'group-hover:scale-110'}`}
                          style={{ 
                            backgroundColor: categoryColors[pin.category] || '#10b981',
                            boxShadow: `0 0 8px ${categoryColors[pin.category] || '#10b981'}80`
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate transition-colors ${selected === pin.id || hoveredPin === pin.id ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-600'}`}>
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
        <Card className="rounded-2xl shadow-sm border flex-1 h-full lg:h-full overflow-hidden relative bg-slate-50 flex items-center justify-center">
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
                onMove={(evt) => {
                  setZoom(evt.viewState.zoom);
                  if (mapRef.current) {
                    const mapBounds = mapRef.current.getMap().getBounds();
                    if (mapBounds) {
                      setBounds([
                        mapBounds.getWest(),
                        mapBounds.getSouth(),
                        mapBounds.getEast(),
                        mapBounds.getNorth()
                      ]);
                    }
                  }
                }}
                onLoad={() => {
                  if (mapRef.current) {
                    const mapBounds = mapRef.current.getMap().getBounds();
                    if (mapBounds) {
                      setBounds([
                        mapBounds.getWest(),
                        mapBounds.getSouth(),
                        mapBounds.getEast(),
                        mapBounds.getNorth()
                      ]);
                    }
                  }
                }}
              >
                <NavigationControl position="top-left" showCompass={false} />

                {/* Clusters & Markers */}
                {clusters.map((cluster) => {
                  const [longitude, latitude] = cluster.geometry.coordinates;
                  const properties = cluster.properties;
                  const props = properties as { cluster?: boolean; point_count?: number; pinId?: string };
                  const isCluster = props?.cluster;
                  const pointCount = props?.point_count;
                  const pinId = props?.pinId;

                  if (isCluster) {
                    // Cluster Marker
                    const expansionZoom = supercluster ? Math.min(supercluster.getClusterExpansionZoom(cluster.id as number), 20) : zoom;
                    return (
                      <Marker
                        key={`cluster-${cluster.id}`}
                        latitude={latitude}
                        longitude={longitude}
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          if (mapRef.current) {
                            mapRef.current.flyTo({
                              center: [longitude, latitude],
                              zoom: expansionZoom,
                              duration: 1000
                            });
                          }
                        }}
                      >
                        <div className="relative group cursor-pointer">
                          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-110" />
                          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-700 text-xs font-black shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-all z-40 transform rotate-45 overflow-hidden">
                             <div className="transform -rotate-45 flex items-center justify-center">
                               {pointCount}
                             </div>
                          </div>
                        </div>
                      </Marker>
                    );
                  }

                  // Individual Pin
                  const pin = pins.find(p => p.id === pinId);
                  if (!pin) return null;
                  
                  const hexColor = categoryColors[pin.category] || '#10b981';
                  const isPinSelected = selected === pin.id;
                  const isHovered = hoveredPin === pin.id;
                  const isActive = isPinSelected || isHovered;
                  
                  return (
                    <Marker
                      key={`pin-${pin.id}`}
                      latitude={pin.lat}
                      longitude={pin.lng}
                      style={{ zIndex: isActive ? 50 : 30 }}
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        handlePinSelect(pin.id);
                      }}
                    >
                      <div className="relative flex flex-col items-center cursor-pointer group">
                        {/* Sophisticated Glow/Pulse */}
                        <div 
                          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full animate-pulse opacity-20 duration-[2000ms] ${isActive ? 'scale-125' : 'scale-0'}`} 
                          style={{ backgroundColor: hexColor }}
                        />
                        
                        {/* Noticeable Minimalist Target */}
                        <div className="relative flex items-center justify-center">
                           <div 
                             className={`absolute rounded-full border transition-all duration-500 ${isActive ? 'w-10 h-10 border-white/50 bg-white/10' : 'w-8 h-8 border-transparent'}`} 
                             style={{ borderColor: isActive ? undefined : `${hexColor}30` }}
                           />
                           
                           <div 
                             className={`relative rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center border-2 border-white transition-all duration-300 ${isActive ? 'w-8 h-8 -translate-y-1' : 'w-6 h-6 group-hover:scale-110'}`}
                           >
                             <div 
                               className={`rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all ${isActive ? 'w-4 h-4' : 'w-3 h-3'}`}
                               style={{ backgroundColor: hexColor }} 
                             />
                           </div>
                        </div>
                        
                        {/* Subtler Link/Tail */}
                        <div 
                          className={`w-[1.5px] h-2 bg-slate-300/50 -mt-0.5 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          style={{ backgroundColor: isActive ? hexColor : undefined }}
                        />
                      </div>
                    </Marker>
                  );
                })}

                {selectedPin && (
                  <Popup
                    latitude={selectedPin.lat}
                    longitude={selectedPin.lng}
                    onClose={() => setSelected(null)}
                    closeButton={false}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={25}
                    className="premium-mapbox-popup z-[60]"
                  >
                    <Card className="p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl w-[260px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative h-28 overflow-hidden">
                        {/* Event Category Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className={`backdrop-blur-md border font-bold text-[10px] uppercase tracking-wider ${categoryBadge[selectedPin.category.toLowerCase()] || 'bg-slate-900/50 text-white border-0'}`}>
                            {selectedPin.category}
                          </Badge>
                        </div>
                        {/* Real cover photo or gradient fallback */}
                        {selectedPin.coverImage ? (
                          <img
                            src={selectedPin.coverImage}
                            alt={selectedPin.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 opacity-30" style={{ backgroundColor: categoryColors[selectedPin.category.toLowerCase()] || '#10b981' }} />
                            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
                              {categoryConfig[selectedPin.category.toLowerCase()]?.icon || '🌍'}
                            </div>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50 border-none z-10"
                          onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-sm text-slate-900 leading-tight mb-3 line-clamp-2">
                          {selectedPin.title}
                        </h3>
                        
                        <div className="space-y-2.5 mb-4">
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                               <CalendarDays className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span>{selectedPin.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                               <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="truncate flex-1">{selectedPin.location}</span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                               <Users className="w-4 h-4 text-amber-600" />
                            </div>
                            <span>{selectedPin.participants} Volunteers joined</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate(`/app/events/${selectedPin?.id}`)}
                          className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs h-10 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          Details <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
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
          <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-lg px-2.5 py-1 text-[10px] font-bold text-muted-foreground shadow-sm pointer-events-none border border-slate-200/50 uppercase tracking-tight">
            Zamboanga City, Philippines
          </div>
        </Card>
      </div>
    </div>
  );
}
