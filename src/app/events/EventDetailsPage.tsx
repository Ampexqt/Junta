import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Map, { Marker } from 'react-map-gl/mapbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Share2,
  FileText,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { API_BASE_URL } from '@/lib/api';

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
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
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
    <div className="space-y-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/events')}
        className="text-muted-foreground -ml-2">

        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-0 uppercase font-black text-[10px] tracking-widest">{event.category}</Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-0 uppercase font-black text-[10px] tracking-widest">
            {event.status === 'published' ? 'Upcoming' : event.status}
          </Badge>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
          {event.title}
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-2 max-w-3xl">
          {event.shortDescription}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                About This Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-[15px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                {event.aboutEvent}
              </div>

              <Separator />

              <div>
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Event Timeline
                </h3>
                <div className="space-y-3">
                  {[...event.timeline]
                    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                    .map((item, i) =>
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5" />
                          {i < event.timeline.length - 1 && <div className="w-0.5 h-6 bg-slate-100" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                            {item.time}
                          </p>
                          <p className="text-[14px] font-bold text-slate-800 tracking-tight">{item.activity}</p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Requirements
                </h3>
                <ul className="space-y-3">
                  {event.requirements.map((r, i) =>
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[14px] text-slate-600 font-bold">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      {r}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Event Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Event Guidelines PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cleanup protocols and safety guidelines
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border overflow-hidden">
            <div className="h-48 bg-slate-50 relative overflow-hidden group">
              {event.coordinates && mapboxToken ? (
                <Map
                  initialViewState={{
                    latitude: event.coordinates.lat,
                    longitude: event.coordinates.lng,
                    zoom: 13
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={mapboxToken}
                  interactive={false}
                >
                  <Marker 
                    latitude={event.coordinates.lat} 
                    longitude={event.coordinates.lng}
                    anchor="bottom"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="absolute -top-1 w-2 h-2 bg-black/20 rounded-full blur-[1px]" />
                      <MapPin className="w-8 h-8 text-primary fill-primary/20 stroke-[2.5px] drop-shadow-md animate-bounce" />
                    </div>
                  </Marker>
                </Map>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f0] via-[#d1e8df] to-[#b8dcc8] opacity-50" />
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

              <div className="absolute bottom-3 right-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm border-none shadow-lg text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl"
                  onClick={() => navigate('/app/map')}>
                  <MapPin className="w-3 h-3 mr-1.5 text-emerald-500" />
                  Open Map
                </Button>
              </div>
            </div>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{event.locationName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                <span>{event.date ? format(new Date(event.date), 'MMMM dd, yyyy') : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>{event.startTime} – {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{event.participantsCount || 0} / {event.capacity || 'Unlimited'} participants</span>
              </div>

              <Separator />

              {joined ?
                <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">
                    You're registered!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send you a reminder before the event.
                  </p>
                </div> :

                <Button
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
                  onClick={() => setJoined(true)}>

                  Join This Event
                </Button>
              }

              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" /> Share Event
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-sm">Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 font-black">
                    {event.organizationName?.substring(0, 2).toUpperCase() || 'ORG'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-[14px] text-slate-900 leading-tight">
                    {event.organizationName || 'Individual/Group'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Organizer Profile
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}
