import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import Map, { Marker } from 'react-map-gl/mapbox';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Share2,
  CheckCircle
} from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

interface EventData {
  id: string;
  title: string;
  shortDescription: string;
  aboutEvent: string;
  category: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  coordinates: { lat: number; lng: number } | null;
  capacity?: number;
  participantsCount?: number;
  organizationName: string;
  organizerName: string;
  coverImage?: string;
  timeline: { id: string; time: string; activity: string }[];
  requirements: string[];
  documents?: { id: string; name: string; url: string }[];
  organizationLogo?: string;
}

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token: mapboxToken } = useMapboxToken();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
          headers
        });
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else if (response.status === 403 || response.status === 401) {
          // If forbidden, they might not be the owner
          setEvent(null);
        }
      } catch (e: unknown) {
        console.error('Error fetching event details:', e);
        sileo.error({ title: 'Sync Error', description: 'Failed to load event details. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900">Event not found</h2>
        <Button variant="link" onClick={() => navigate('/app/events')}>Back to Events</Button>
      </div>
    );
  }

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(' ');
    const [rawHours, minutes] = time.split(':').map(Number);
    let hours = rawHours;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  return (
    <div className="space-y-6 max-w-7xl pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Utilities */}
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/events')}
          className="text-slate-400 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-bold text-[11px] uppercase tracking-widest">Back to Events</span>
        </Button>
        <div className="flex items-center gap-3">
           <Badge className="bg-white/80 backdrop-blur-md text-emerald-600 border border-emerald-100 shadow-sm font-black text-[9px] px-3 py-1 rounded-full tracking-widest uppercase">{event.category}</Badge>
           <Badge className="bg-blue-600 text-white border-0 shadow-lg shadow-blue-200 font-black text-[9px] px-3 py-1 rounded-full tracking-widest uppercase">{event.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Hero Card - Bento Large */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex flex-col md:flex-row p-8 gap-8 items-center md:items-stretch">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-2">
                  <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900 tracking-tight leading-[1.1]">
                    {event.title}
                  </h1>
                  <p className="text-slate-500 font-medium text-base leading-relaxed max-w-xl">
                    {event.shortDescription}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                  <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Event Date</p>
                      <p className="text-[13px] font-bold text-slate-700">{event.date ? format(new Date(event.date), 'MMMM dd, yyyy') : 'TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Schedule</p>
                      <p className="text-[13px] font-bold text-slate-700">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {event.coverImage && (
                <div className="w-full md:w-[240px] aspect-square rounded-[24px] overflow-hidden shadow-2xl relative">
                  <img src={event.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl text-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600/60 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                About Event
              </h3>
              <div className="text-[14px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap max-h-[300px] overflow-y-auto no-scrollbar mask-gradient-bottom">
                {event.aboutEvent}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600/60 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 Event Timeline
              </h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                {[...event.timeline]
                  .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                  .map((item, i) => (
                    <div key={item.id} className="flex gap-4 relative">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-white border-2 border-emerald-500 z-10 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        {i < event.timeline.length - 1 && (
                          <div className="w-[2px] h-full absolute top-[12px] left-[5px] bg-emerald-200" />
                        )}
                      </div>
                      <div className="space-y-0.5 pb-2">
                        <span className="text-[10px] font-black text-emerald-600/70 uppercase tabular-nums tracking-wider">{item.time}</span>
                        <h4 className="text-[13px] font-black text-slate-800 tracking-tight">{item.activity}</h4>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Actions & Logistics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="h-44 bg-slate-100 relative">
              {event.coordinates && mapboxToken ? (
                <Map
                  initialViewState={{ latitude: event.coordinates.lat, longitude: event.coordinates.lng, zoom: 14 }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/standard"
                  mapboxAccessToken={mapboxToken}
                  interactive={false}
                >
                  <Marker latitude={event.coordinates.lat} longitude={event.coordinates.lng} anchor="bottom">
                    <div className="relative">
                       <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-pulse scale-75" />
                       <div className="relative w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-inner" />
                       </div>
                    </div>
                  </Marker>
                </Map>
              ) : <div className="absolute inset-0 bg-slate-50 animate-pulse" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              <Button size="icon" className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md shadow-lg border-white/40 text-slate-600 hover:bg-white" onClick={() => navigate('/app/map')}>
                 <MapPin className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-100/50">
                   <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exact Venue</p>
                   <p className="text-[13px] font-bold text-slate-800 leading-tight">{event.locationName}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {joined ? (
                  <div className="bg-emerald-500 p-4 rounded-2xl flex items-center gap-4 shadow-[0_8px_24px_rgba(16,185,129,0.2)] animate-in zoom-in-95">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                       <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">Registration Confirmed</p>
                  </div>
                ) : (
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg" 
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/events/${id}/join`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
                        });
                        if (response.ok) setJoined(true);
                        else throw new Error('Join failed');
                      } catch (err) { sileo.error({ title: 'Error', description: 'Failed to register' }); }
                    }}
                  >
                    Join This Mission <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
                  </Button>
                )}
                <Button variant="ghost" className="w-full h-10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-primary/5 hover:text-primary">
                  <Share2 className="w-4 h-4 mr-2" /> Share with Friends
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-6">
             <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Mandatory Items</h3>
                <div className="flex flex-col gap-2">
                  {event.requirements.map((r, i) => (
                    <Badge key={i} className="bg-emerald-50/50 text-emerald-700 border border-emerald-100/50 px-3 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-tighter shadow-sm flex items-center gap-1.5 w-fit">
                      <CheckCircle className="w-3 h-3 opacity-60" />
                      {r}
                    </Badge>
                  ))}
                </div>
             </div>
             <Separator className="opacity-40" />
             <div className="flex items-center gap-4">
               <div className="relative">
                 <Avatar className="w-12 h-12 border-2 border-white shadow-xl rounded-2xl">
                   <AvatarImage src={event.organizationLogo} />
                   <AvatarFallback className="bg-slate-900 text-white text-xs font-black">OG</AvatarFallback>
                 </Avatar>
                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                 </div>
               </div>
               <div>
                 <p className="text-sm font-black text-slate-900 transition-colors">{event.organizationName}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Organization Name</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
