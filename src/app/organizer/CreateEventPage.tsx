import { useState, useRef } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { useMapboxToken } from '@/hooks/useMapboxToken';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import {
  Card
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {

  Users,
  ImageIcon,
  CheckCircle,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Globe,
  Lock as LockIcon,
  Mail,
  Upload,
  Info,
  Search,
  Loader2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';


// --- TYPES & INTERFACES ---

interface TimelineItem {
  id: string;
  time: string;
  activity: string;
  description: string;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string;
}

interface EventFormData {
  title: string;
  category: string;
  shortDescription: string;
  visibility: 'public' | 'private' | 'invite-only';
  locationName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  timeline: TimelineItem[];
  requirements: string[];
  documents: DocumentItem[];
  coverImage: File | null;
  gallery: File[];
  coordinates: { lat: number; lng: number } | null;
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    category: '',
    shortDescription: '',
    visibility: 'public',
    locationName: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    timeline: [{ id: '1', time: '', activity: '', description: '' }],
    requirements: [],
    documents: [],
    coverImage: null,
    gallery: [],
    coordinates: null
  });

const categoryEmoji: Record<string, string> = {
  cleanup: '🧹',
  planting: '🌱',
  workshop: '🎓',
  seminar: '🏛️',
  research: '🧬',
  other: '📍',
};
const { token } = useMapboxToken();

  const [newRequirement, setNewRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!token) return;
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1&types=poi,address,neighborhood,locality,place`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        updateFormData('locationName', data.features[0].place_name.split(',')[0]);
      }
    } catch (e) {
      console.error('Reverse geocode failed:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const searchLocation = async () => {
    if (!formData.locationName || !token) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.locationName)}.json?access_token=${token}&limit=5&proximity=122.0650,6.9150&country=PH&types=poi,address,neighborhood,locality,place,region`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const best = data.features[0];
        const [lng, lat] = best.center;
        updateFormData('coordinates', { lat, lng });
        updateFormData('locationName', best.place_name.split(',')[0]);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
        sileo.success({
          title: 'Location Found',
          description: best.place_name,
          duration: 2500
        });
      } else {
        sileo.error({ title: 'Not Found', description: 'Try a different spelling, or manually pin the location directly on the map below.' });
      }
    } catch (e) {
      console.error(e);
      sileo.error({ title: 'Network Error', description: 'Failed to search location.' });
    } finally {
      setIsGeocoding(false);
    }
  };

  // --- HANDLERS ---

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateFormData = <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTimelineItem = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { id: Math.random().toString(36), time: '', activity: '', description: '' }]
    }));
  };

  const removeTimelineItem = (id: string) => {
    if (formData.timeline.length === 1) return;
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter(item => item.id !== id)
    }));
  };

  const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      updateFormData('requirements', [...formData.requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    updateFormData('requirements', formData.requirements.filter(r => r !== req));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Logic for submitting to Firebase / API would go here
      
      sileo.success({
        title: 'Event Submitted',
        description: 'Your event has been sent for admin approval!',
        duration: 2000
      });
      
      navigate('/app/organizer/submissions');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      sileo.error({
        title: 'Submission Failed',
        description: errorMsg,
        duration: 2000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 6) * 100;

  // --- STEP COMPONENTS ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-[13px] font-semibold text-slate-700">Event Title <span className="text-rose-500">*</span></Label>
          <Input 
            id="title" 
            placeholder="e.g., Zamboanga Beach Cleanup 2025" 
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-[13px] font-semibold text-slate-700">Category <span className="text-rose-500">*</span></Label>
            <Select onValueChange={(v) => updateFormData('category', v)} value={formData.category}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleanup">Cleanup Drive</SelectItem>
                <SelectItem value="workshop">Educational Workshop</SelectItem>
                <SelectItem value="seminar">Seminar / Talk</SelectItem>
                <SelectItem value="planting">Tree Planting</SelectItem>
                <SelectItem value="research">Eco Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-[13px] font-semibold text-slate-700">Visibility <span className="text-rose-500">*</span></Label>
            <Select onValueChange={(v) => updateFormData('visibility', v as EventFormData['visibility'])} value={formData.visibility}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Private</span>
                  </div>
                </SelectItem>

                <SelectItem value="invite-only">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>Invite Only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tagline" className="text-[13px] font-semibold text-slate-700">Short Description / Tagline <span className="text-rose-500">*</span></Label>
          <Textarea 
            id="tagline" 
            placeholder="A brief one-sentence hook for your event..." 
            value={formData.shortDescription}
            onChange={(e) => updateFormData('shortDescription', e.target.value)}
            className="min-h-[80px] rounded-xl border-slate-200 focus-visible:ring-primary/20 resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="grid gap-2">
        <Label htmlFor="location" className="text-[13px] font-semibold text-slate-700">Location Name <span className="text-rose-500">*</span></Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input 
              id="location" 
              placeholder="e.g., Sta. Cruz Island Park" 
              value={formData.locationName}
              onChange={(e) => updateFormData('locationName', e.target.value)}
              className="h-11 rounded-xl pr-8"
            />
            {isReverseGeocoding && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />
            )}
          </div>
          <button
            type="button"
            onClick={searchLocation}
            disabled={isGeocoding || !formData.locationName}
            className="h-11 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeocoding
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400">Can't find it? Manually click the map to pin the exact spot — then drag to fine-tune.</p>
      </div>

      <div className="grid gap-2">
        <Label className="text-[13px] font-semibold text-slate-700">Pin Location <span className="text-rose-500">*</span></Label>
        <div className="relative group overflow-hidden rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:border-primary/20 bg-slate-50">
          <div className="w-full h-48 sm:h-64">
            {token ? (
              <Map
                ref={mapRef}
                initialViewState={{
                  latitude: formData.coordinates?.lat || 6.9214,
                  longitude: formData.coordinates?.lng || 122.039,
                  zoom: 12
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={token}
                onClick={(e) => {
                  const { lat, lng } = e.lngLat;
                  updateFormData('coordinates', { lat, lng });
                  reverseGeocode(lat, lng);
                }}
              >
                {formData.coordinates && (
                  <Marker 
                    latitude={formData.coordinates.lat} 
                    longitude={formData.coordinates.lng}
                    anchor="bottom"
                    draggable
                    onDragEnd={(e) => {
                      const { lat, lng } = e.lngLat;
                      updateFormData('coordinates', { lat, lng });
                      reverseGeocode(lat, lng);
                    }}
                  >
                    <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing">
                      <div className="absolute -top-1 w-10 h-10 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative w-10 h-10 rounded-2xl bg-primary border-2 border-white flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 active:scale-95 animate-bounce">
                        <span className="text-xl">
                          {categoryEmoji[formData.category.toLowerCase()] || '📍'}
                        </span>
                      </div>
                      {/* Custom Pointer Tail */}
                      <div className="w-3 h-3 bg-primary rotate-45 -mt-1.5 border-r border-b border-white" />
                    </div>
                  </Marker>
                )}
              </Map>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin mb-2" />
                <span className="text-xs font-medium">Loading Map...</span>
              </div>
            )}
          </div>
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-white/90 text-[10px] text-slate-600 border-slate-100 backdrop-blur-sm shadow-sm pointer-events-none font-bold">
              {formData.coordinates 
                 ? `📍 ${formData.coordinates.lat.toFixed(5)}, ${formData.coordinates.lng.toFixed(5)}`
                 : 'Click map to drop pin'}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {formData.coordinates ? 'Drag pin to adjust' : 'Click to Pick Location'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date" className="text-[13px] font-semibold text-slate-700">Event Date <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Input 
              id="date" 
              type="date" 
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              className="h-11 rounded-xl pl-10" 
            />
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="capacity" className="text-[13px] font-semibold text-slate-700">Total Capacity <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Input 
              id="capacity" 
              type="number" 
              placeholder="e.g., 50" 
              value={formData.capacity}
              onChange={(e) => updateFormData('capacity', e.target.value)}
              className="h-11 rounded-xl pl-10" 
            />
            <Users className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start" className="text-[13px] font-semibold text-slate-700">Start Time <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Input 
              id="start" 
              type="time" 
              value={formData.startTime}
              onChange={(e) => updateFormData('startTime', e.target.value)}
              className="h-11 rounded-xl pl-10" 
            />
            <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end" className="text-[13px] font-semibold text-slate-700">End Time <span className="text-rose-500">*</span></Label>
          <div className="relative">
            <Input 
              id="end" 
              type="time" 
              value={formData.endTime}
              onChange={(e) => updateFormData('endTime', e.target.value)}
              className="h-11 rounded-xl pl-10" 
            />
            <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="flex items-center justify-between">
        <Label className="text-[13px] font-semibold text-slate-700">Event Activities</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addTimelineItem}
          className="h-8 rounded-lg border-slate-200 text-xs font-semibold hover:bg-slate-50 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add activity
        </Button>
      </div>

      <div className="space-y-4">
        {formData.timeline.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative group"
          >
            <div className="absolute -left-1.5 top-4 w-3 h-3 rounded-full bg-primary/20 border-2 border-white shadow-sm" />
            
            <div className="grid gap-4">
              <div className="flex gap-4">
                <Input 
                  type="time" 
                  value={item.time}
                  onChange={(e) => updateTimelineItem(item.id, 'time', e.target.value)}
                  className="w-32 h-10 rounded-xl"
                />
                <Input 
                  placeholder="Activity Title (e.g., Briefing)" 
                  value={item.activity}
                  onChange={(e) => updateTimelineItem(item.id, 'activity', e.target.value)}
                  className="flex-1 h-10 rounded-xl"
                />
                {formData.timeline.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeTimelineItem(item.id)}
                    className="h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Textarea 
                placeholder="Brief description of the activity..."
                value={item.description}
                onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)}
                className="min-h-[60px] rounded-xl text-xs bg-white"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="space-y-4">
        <Label className="text-[13px] font-semibold text-slate-700">Things to Bring (Requirements)</Label>
        <div className="flex gap-2">
          <Input 
            placeholder="e.g., Sunscreen, 2L Water" 
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className="h-11 rounded-xl flex-1"
          />
          <Button onClick={addRequirement} className="h-11 aspect-square p-0 rounded-xl bg-slate-900 group">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {formData.requirements.length === 0 && (
            <span className="text-xs text-slate-400 italic">No requirements added yet.</span>
          )}
          {formData.requirements.map((req, i) => (
            <Badge 
              key={i} 
              variant="secondary" 
              className="pl-3 pr-1.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border-none flex items-center gap-1.5 transition-colors"
            >
              <span className="text-[12px] font-medium text-slate-700">{req}</span>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => removeRequirement(req)}
                className="w-5 h-5 rounded-full hover:bg-slate-300 text-slate-500 transition-colors p-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100" />

      <div className="space-y-4">
        <Label className="text-[13px] font-semibold text-slate-700">Required Documents & Waivers</Label>
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 hover:border-primary/40 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Upload waiver templates or instructions</p>
          <p className="text-xs text-slate-500 mt-1">PDF, DOCX or JPEG up to 5MB</p>
          <input type="file" className="hidden" multiple />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-[13px] font-semibold text-slate-700">Event Cover Image <span className="text-rose-500">*</span></Label>
          <Badge variant="outline" className="text-[10px] text-primary border-primary/20 uppercase font-bold px-1.5 bg-primary/[0.02]">Required</Badge>
        </div>
        
        <div className="aspect-[21/9] w-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative group">
          <ImageIcon className="w-10 h-10 mb-2 opacity-50 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-slate-800">Choose a high-quality cover image</span>
          <span className="text-[11px] mt-1">Recommended: 1200x510px</span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[13px] font-semibold text-slate-700">Gallery Photos (Optional)</Label>
        <div className="grid grid-cols-4 gap-3">
          <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-primary/30 hover:bg-slate-100 transition-all cursor-pointer">
            <Plus className="w-6 h-6" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-500">
      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Review your Event</h4>
          <p className="text-sm text-slate-600">Please verify all details before submitting for approval. This can take up to 24 hours.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Event Title</span>
            <p className="font-semibold text-slate-800">{formData.title || '---'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Category</span>
            <p className="font-semibold text-slate-800 capitalize">{formData.category || '---'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Date & Time</span>
            <p className="font-semibold text-slate-800">
              {formData.date || '---'} | {formData.startTime} - {formData.endTime}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Capacity</span>
            <p className="font-semibold text-slate-800">{formData.capacity || '---'} Pax</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Location</span>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="font-medium">{formData.locationName || '---'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Timeline Highlights</span>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{formData.timeline.length} Activities</Badge>
          </div>
          <div className="space-y-3">
            {formData.timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs font-bold text-primary w-14">{item.time || '--:--'}</span>
                <p className="text-xs text-slate-600 font-medium">{item.activity || '---'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">Post New Event</h1>
          <p className="text-slate-500 font-medium">Join our community in making a positive impact.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">0{step}</span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Step</span>
            <span className="text-xs font-bold text-slate-900">Total 06</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{step === 1 ? 'Start' : step === 6 ? 'Final Review' : `Step ${step}`}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2.5 rounded-full bg-slate-100" />
      </div>

      {/* Form Card */}
      <Card className="rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border-slate-100 overflow-hidden bg-white">
        <div className="px-6 sm:px-10 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              {step === 1 && 'Basic Event Information'}
              {step === 2 && 'Location & Schedule'}
              {step === 3 && 'Event Timeline'}
              {step === 4 && 'Requirements & Documents'}
              {step === 5 && 'Media Upload'}
              {step === 6 && 'Review & Submit'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 && 'Let\'s start with the basics of your event.'}
              {step === 2 && 'Where and when should participants gather?'}
              {step === 3 && 'Break down the activities during your event.'}
              {step === 4 && 'Help participants prepare with clear requirements.'}
              {step === 5 && 'Visuals help participants get excited about your event.'}
              {step === 6 && 'Double check your info for perfect accuracy.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              {step === 6 && renderStep6()}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="h-11 px-6 rounded-xl font-semibold gap-2 transition-all hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < 6 ? (
              <Button
                onClick={handleNext}
                className="h-11 px-8 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>Submit for Approval <CheckCircle className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tip / Footer Info */}
      <div className="text-center p-6 sm:p-8 rounded-[24px] bg-slate-50 border border-slate-100">
        <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
          <Info className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Expert Tip</span>
        </div>
        <p className="text-[13px] text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
          Detailed timelines and high-quality cover images increase participant engagement by over 40%. Double-check your pin location!
        </p>
      </div>
    </div>);
}
