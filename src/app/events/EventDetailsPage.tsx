import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/AuthContext';

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

const categoryIcons: Record<string, string> = {
  cleanup: '🧹', planting: '🌱', workshop: '🎓',
  seminar: '🏛️', research: '🧬', awareness: '📣', other: '📍',
};

const categoryColors: Record<string, string> = {
  cleanup: '#ef4444',
  planting: '#10b981',
  workshop: '#f59e0b',
  seminar: '#3b82f6',
  research: '#8b5cf6',
  other: '#64748b',
};

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token: mapboxToken } = useMapboxToken();
  const { uid } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('');

  // Fetch event + hasJoined status — re-runs when uid changes (handles re-login)
  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/events/${id}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setLiveStatus(data.status || '');
        setJoined(data.hasJoined || false);
      } else if (response.status === 403 || response.status === 401) {
        setEvent(null);
      }
    } catch (e: unknown) {
      console.error('Error fetching event details:', e);
      sileo.error({ title: 'Sync Error', description: 'Failed to load event details. Please try again later.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Re-fetch whenever id or uid changes (handles logout → re-login)
  useEffect(() => {
    fetchEvent();
  }, [fetchEvent, uid]);

  // Real-time status listener
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'events', id), (snap) => {
      const newStatus = snap.data()?.status;
      if (newStatus) setLiveStatus(newStatus);
    });
    return () => unsub();
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
                    <div className="relative flex flex-col items-center group">
                      <div className="absolute -top-1 w-8 h-8 rounded-full animate-ping" style={{ backgroundColor: `${categoryColors[event.category.toLowerCase()] || '#10b981'}40` }} />
                      <div
                        className="flex items-center justify-center rounded-2xl border-2 border-white shadow-xl transition-all duration-300 w-10 h-10 -translate-y-2"
                        style={{ backgroundColor: categoryColors[event.category.toLowerCase()] || '#10b981' }}
                      >
                        <span className="text-lg">{categoryIcons[event.category.toLowerCase()] || '📍'}</span>
                      </div>
                      <div
                        className="w-3 h-3 rotate-45 -mt-1.5 border-r border-b border-white transition-all opacity-100"
                        style={{ backgroundColor: categoryColors[event.category.toLowerCase()] || '#10b981' }}
                      />
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
                ) : (liveStatus === 'published' || liveStatus === 'approved') ? (
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg disabled:opacity-70"
                    disabled={isJoining}
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      // If no token at all, redirect to login
                      if (!token) {
                        sileo.error({ title: 'Login Required', description: 'Please log in to join this event.' });
                        navigate('/login');
                        return;
                      }
                      setIsJoining(true);
                      try {
                        const response = await fetch(`${API_BASE_URL}/events/${id}/join`, {
                          method: 'POST',
                          headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const resData = await response.json();
                        if (response.ok) {
                          setJoined(true);
                          sileo.success({ title: 'Registered!', description: 'You have successfully joined this event.' });
                        } else if (response.status === 400 && resData.error?.includes('already joined')) {
                          // Already joined — just reflect this in the UI
                          setJoined(true);
                          sileo.info({ title: 'Already Registered', description: 'You are already registered for this event.' });
                        } else if (response.status === 401 || response.status === 403) {
                          sileo.error({ title: 'Session Expired', description: 'Your session has expired. Please log in again.' });
                          navigate('/login');
                        } else {
                          throw new Error(resData.error || 'Join failed');
                        }
                      } catch (err: unknown) {
                        sileo.error({ title: 'Error', description: (err instanceof Error ? err.message : null) || 'Failed to register' });
                      } finally {
                        setIsJoining(false);
                      }
                    }}
                  >
                    {isJoining ? 'Registering...' : <>Join This Mission <ArrowLeft className="w-4 h-4 rotate-180 ml-2" /></>}
                  </Button>
                ) : liveStatus === 'ongoing' ? (
                  <Button disabled className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-none bg-amber-50 text-amber-600 border border-amber-200 opacity-100 cursor-not-allowed">
                    🟢 Event In Progress
                  </Button>
                ) : liveStatus === 'completed' ? (
                  <Button disabled className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-none bg-slate-100 text-slate-400 opacity-100 cursor-not-allowed">
                    🏁 Event Has Ended
                  </Button>
                ) : (
                  <Button disabled className="w-full bg-slate-100 text-slate-400 border-none h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-none opacity-100 cursor-not-allowed">
                    Registration Unavailable
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
