import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus,
  Trash2,
  MapPin,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  Image as ImageIcon,
  Globe,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { API_BASE_URL } from '@/lib/api';

// --- TYPES ---

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
  coverImage: string | null;
  coordinates: { lat: number; lng: number } | null;
  aboutEvent: string;
}

interface CreateEventModalProps {
  trigger?: React.ReactNode;
}

export function CreateEventModal({ trigger }: CreateEventModalProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');

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
    coordinates: null,
    aboutEvent: ''
  });
  const [profile, setProfile] = useState<{ orgName?: string } | null>(null);
  const { token } = useMapboxToken();
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      };
      fetchProfile();
    }
  }, [open]);

  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${min} ${ampm}`;
  });

  const stepTitles = [
    'Base Identity',
    'Core Logistics',
    'Sequence of Action',
    'Operational Needs',
    'Visual Presence',
    'Final Validation'
  ];

  const progress = (step / 6) * 100;

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const getTimeParts = (timeStr: string) => {
    if (!timeStr) return { hour: '08', minute: '00', period: 'AM' };
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':');
    return { hour, minute, period };
  };

  const updateTime = (key: 'startTime' | 'endTime', part: 'hour' | 'minute' | 'period', value: string) => {
    const current = getTimeParts(formData[key]);
    current[part] = value;
    updateFormData(key, `${current.hour}:${current.minute} ${current.period}`);
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(' ');
    const [rawHours, minutes] = time.split(':').map(Number);
    let hours = rawHours;
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const filteredTimeOptions = timeOptions.filter(t => {
    const startMins = timeToMinutes(formData.startTime || '12:00 AM');
    const endMins = timeToMinutes(formData.endTime || '11:59 PM');
    const currentMins = timeToMinutes(t);
    // If end time is technically earlier than start (e.g. overnight), just show all
    if (endMins < startMins) return true;
    return currentMins >= startMins && currentMins <= endMins;
  });

  // --- HANDLERS ---

  const handleNext = () => { if (step < 6) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTimelineItem = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [{ id: Math.random().toString(36), time: '', activity: '', description: '' }, ...prev.timeline]
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      sileo.error({ 
        title: 'File Too Large', 
        description: `The selected ${type} exceeds the 8MB limit. Please choose a smaller file.` 
      });
      event.target.value = '';
      return;
    }

    if (type === 'document') setIsUploadingDoc(true);
    else setIsUploadingImage(true);

    let fileToUpload: File | Blob = file;

    // Client-side image compression
    if (type === 'image') {
      try {
        fileToUpload = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 1600;
              const MAX_HEIGHT = 1600;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                else reject(new Error('Canvas to Blob failed'));
              }, 'image/jpeg', 0.82); // 82% quality is a sweet spot for web
            };
            img.onerror = () => reject(new Error('Image load failed'));
          };
          reader.onerror = () => reject(new Error('File reader failed'));
        });
      } catch (err) {
        console.warn('Compression failed, falling back to original file:', err);
        fileToUpload = file;
      }
    }

    const uploadFormData = new FormData();
    uploadFormData.append(type, fileToUpload);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: uploadFormData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      if (type === 'document') {
        updateFormData('documents', [{ id: data.public_id, name: file.name, url: data.url }]);
      } else {
        updateFormData('coverImage', data.url);
      }
    } catch (err: any) {
      sileo.error({ title: 'Upload Failed', description: err.message });
    } finally {
      if (type === 'document') setIsUploadingDoc(false);
      else setIsUploadingImage(false);
      // Reset input
      event.target.value = '';
    }
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.date || !formData.coverImage) {
      sileo.error({ 
        title: 'Missing Details', 
        description: 'Please ensure title, category, date, and hero image are provided.' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      sileo.success({ 
        title: 'Event Created', 
        description: 'Your event has been sent for approval!', 
        duration: 3000 
      });
      
      setIsSubmitting(false);
      setOpen(false);
      navigate('/app/organizer/submissions');
    } catch (err: any) {
      console.error('Submit error:', err);
      sileo.error({ 
        title: 'Submission Failed', 
        description: err.message || 'An error occurred while creating your event.' 
      });
      setIsSubmitting(false);
    }
  };

  // --- RENDERS ---

  const renderStep1 = () => (
    <div className="space-y-4 py-2">
      <div className="grid gap-1.5">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Event Title <span className="text-rose-500">*</span></Label>
        <Input 
          placeholder="e.g., Zamboanga Beach Cleanup 2025" 
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">Category <span className="text-rose-500">*</span></Label>
          <Select onValueChange={(v) => updateFormData('category', v)} value={formData.category}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-50/50">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectItem value="cleanup">Cleanup Drive</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="planting">Tree Planting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">Visibility <span className="text-rose-500">*</span></Label>
          <Select onValueChange={(v) => updateFormData('visibility', v)} value={formData.visibility}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-50/50">
              <SelectValue placeholder="Choose visibility" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="invite-only">Invite Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Tagline <span className="text-rose-500">*</span></Label>
        <Input 
          placeholder="Brief summary..." 
          value={formData.shortDescription}
          onChange={(e) => updateFormData('shortDescription', e.target.value)}
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-primary/20"
        />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">About This Event <span className="text-rose-500">*</span></Label>
        <Textarea 
          placeholder="Detailed description of the event..." 
          value={formData.aboutEvent}
          onChange={(e) => updateFormData('aboutEvent', e.target.value)}
          className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50/50 resize-none focus:ring-primary/20"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 py-2">
      <div className="grid gap-1.5">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Location Name <span className="text-rose-500">*</span></Label>
        <Input 
          placeholder="e.g., Sta. Cruz Island" 
          value={formData.locationName}
          onChange={(e) => updateFormData('locationName', e.target.value)}
          className="h-10 rounded-xl bg-slate-50/50"
        />
      </div>
      
      <div className="grid gap-1.5">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Pin Location <span className="text-rose-500">*</span></Label>
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
          {token ? (
            <Map
              initialViewState={{
                latitude: formData.coordinates?.lat || 6.9214,
                longitude: formData.coordinates?.lng || 122.039,
                zoom: 12
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={token}
              onClick={(e) => {
                updateFormData('coordinates', { lat: e.lngLat.lat, lng: e.lngLat.lng });
              }}
            >
              {formData.coordinates && (
                <Marker 
                  latitude={formData.coordinates.lat} 
                  longitude={formData.coordinates.lng}
                  anchor="bottom"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="absolute -top-1 w-2 h-2 bg-black/20 rounded-full blur-[1px]" />
                    <MapPin className="w-8 h-8 text-primary fill-primary/20 stroke-[2.5px] drop-shadow-md animate-bounce" />
                  </div>
                </Marker>
              )}
            </Map>
          ) : (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-primary rounded-full animate-spin mb-2" />
              <span className="text-[11px] font-medium tracking-tight">Initializing Mapbox...</span>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 right-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-80">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
              {formData.coordinates 
                ? `Pinned: ${formData.coordinates.lat.toFixed(4)}, ${formData.coordinates.lng.toFixed(4)}`
                : 'Click map to set exact event pin'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">Date <span className="text-rose-500">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 rounded-xl bg-slate-50/50 justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(formData.date) : undefined}
                onSelect={(date) => updateFormData('date', date?.toISOString() || '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">Capacity <span className="text-rose-500">*</span></Label>
          <Input type="number" placeholder="50" value={formData.capacity} onChange={(e) => updateFormData('capacity', e.target.value)} className="h-10 rounded-xl bg-slate-50/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">Start Time <span className="text-rose-500">*</span></Label>
          <div className="flex items-center gap-1">
            <div className="flex-1 flex items-center bg-slate-50/50 rounded-xl border border-slate-100 p-0.5 overflow-hidden">
                <Select 
                  value={getTimeParts(formData.startTime).hour} 
                  onValueChange={(val) => updateTime('startTime', 'hour', val)}
                >
                  <SelectTrigger className="border-none shadow-none bg-transparent h-9 text-[13px] px-3 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-slate-300 font-bold">:</span>
                <Select 
                  value={getTimeParts(formData.startTime).minute} 
                  onValueChange={(val) => updateTime('startTime', 'minute', val)}
                >
                  <SelectTrigger className="border-none shadow-none bg-transparent h-9 text-[13px] px-3 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <Select 
              value={getTimeParts(formData.startTime).period} 
              onValueChange={(val) => updateTime('startTime', 'period', val)}
            >
              <SelectTrigger className="w-[70px] h-10 rounded-xl bg-slate-900 text-white border-none text-[11px] font-black tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-bold text-slate-700 ml-1">End Time <span className="text-rose-500">*</span></Label>
          <div className="flex items-center gap-1">
            <div className="flex-1 flex items-center bg-slate-50/50 rounded-xl border border-slate-100 p-0.5 overflow-hidden">
                <Select 
                  value={getTimeParts(formData.endTime).hour} 
                  onValueChange={(val) => updateTime('endTime', 'hour', val)}
                >
                  <SelectTrigger className="border-none shadow-none bg-transparent h-9 text-[13px] px-3 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-slate-300 font-bold">:</span>
                <Select 
                  value={getTimeParts(formData.endTime).minute} 
                  onValueChange={(val) => updateTime('endTime', 'minute', val)}
                >
                  <SelectTrigger className="border-none shadow-none bg-transparent h-9 text-[13px] px-3 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <Select 
              value={getTimeParts(formData.endTime).period} 
              onValueChange={(val) => updateTime('endTime', 'period', val)}
            >
              <SelectTrigger className="w-[70px] h-10 rounded-xl bg-slate-900 text-white border-none text-[11px] font-black tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 py-2 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
      {/* Informational Guidance Note */}
      <div className="px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.05em] text-emerald-600/70">Planned Schedule</p>
          <p className="text-[13px] font-bold text-emerald-900 leading-none">
            {formData.startTime || '08:00 AM'} — {formData.endTime || '05:00 PM'}
          </p>
          <p className="text-[10px] text-emerald-700/60 font-medium">Use this range to map out your event's internal sequence below.</p>
        </div>
      </div>

      <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md pb-2 z-10 -mx-1 px-1">
        <Label className="text-[12px] font-black uppercase tracking-widest text-slate-400">Timeline Structure</Label>
        <Button variant="outline" size="sm" onClick={addTimelineItem} className="h-8 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl bg-slate-900 text-white border-none hover:bg-black transition-all">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Entry
        </Button>
      </div>
      {formData.timeline.map((item) => (
        <div key={item.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3 relative group transition-all hover:bg-white hover:shadow-md">
          <div className="flex gap-2">
            <Select value={item.time} onValueChange={(val) => updateTimelineItem(item.id, 'time', val)}>
              <SelectTrigger className="w-[124px] h-9 rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]" position="popper">
                {filteredTimeOptions.length > 0 ? (
                    filteredTimeOptions.map((time) => (
                      <SelectItem key={time} value={time} className="text-[11px] font-medium">{time}</SelectItem>
                    ))
                ) : (
                    <SelectItem value="none" disabled>Adjust Step 2</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input placeholder="What's happening?" value={item.activity} onChange={(e) => updateTimelineItem(item.id, 'activity', e.target.value)} className="flex-1 h-9 rounded-lg border-slate-200" />
            <Button variant="ghost" size="icon" onClick={() => removeTimelineItem(item.id)} className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
          </div>
          <Textarea placeholder="More details..." value={item.description} onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)} className="min-h-[50px] text-xs h-12 rounded-lg resize-none bg-white border-slate-100" />
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5 py-2">
      <div className="space-y-3">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Mandatory Items</Label>
        <div className="flex gap-2">
          <Input 
            placeholder="e.g., Water Bottle" 
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
            className="h-10 rounded-xl bg-slate-50/50"
          />
          <Button onClick={addRequirement} className="h-10 bg-primary/10 text-primary hover:bg-primary/20 px-3 rounded-xl border border-primary/10"><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
          {formData.requirements.length === 0 && <p className="text-[10px] text-slate-400 italic ml-1">No items added yet...</p>}
          {formData.requirements.map((r, i) => (
            <Badge key={i} variant="secondary" className="px-2.5 py-1 rounded-full bg-white border border-slate-100 shadow-sm text-[11px] gap-1.5 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all group/badge">
              {r} 
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateFormData('requirements', formData.requirements.filter(req => req !== r));
                }}
                className="pointer-events-auto ml-1 p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Remove requirement"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <Separator className="bg-slate-100" />
      <div className="space-y-3">
        <Label className="text-[12px] font-bold text-slate-700 ml-1 underline decoration-primary/30 underline-offset-4">Reference Documents</Label>
        
        {formData.documents.length > 0 ? (
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-700 truncate">{formData.documents[0].name}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Uploaded Successfully</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => updateFormData('documents', [])} className="text-slate-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="relative p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer group">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={(e) => handleFileUpload(e, 'document')}
              disabled={isUploadingDoc}
            />
            {isUploadingDoc ? (
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                <Upload className="w-5 h-5" />
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-600">{isUploadingDoc ? 'Uploading document...' : 'Import PDF/DOCX materials'}</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">Maximum file size 8MB</p>
          </label>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-5 py-2">
      <div className="space-y-3">
        <Label className="text-[12px] font-bold text-slate-700 ml-1">Event Showcase <span className="text-rose-500">*</span></Label>
        
        {formData.coverImage ? (
          <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <img src={formData.coverImage} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="destructive" size="sm" onClick={() => updateFormData('coverImage', null)} className="h-8 rounded-lg font-bold">
                <Trash2 className="w-4 h-4 mr-1.5" /> Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <label className="relative aspect-[21/9] w-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={(e) => handleFileUpload(e, 'image')}
              disabled={isUploadingImage}
            />
            {isUploadingImage ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 mb-2 text-primary animate-spin" />
                <span className="text-[11px] font-bold text-primary">Uploading Image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-[11px] font-bold text-slate-500">Upload Hero Image</span>
              </div>
            )}
          </label>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="px-1">
      <div className="space-y-5 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
        {/* 1. Visual Header - Minimalist */}
        {formData.coverImage && (
          <div className="relative h-36 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
             <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        {/* 2. Content Flow - Single Column */}
        <div className="space-y-6 pt-2">
            <div className="space-y-1.5">
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black uppercase text-[8px] px-2 py-0.5 tracking-tighter">
                        {formData.category || 'Category'}
                    </Badge>
                    <Badge className="bg-emerald-500 text-white border-none font-black uppercase text-[8px] px-2 py-0.5 tracking-tighter shadow-sm">
                        {formData.visibility}
                    </Badge>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{formData.title || 'Untitled Action'}</h2>
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Organizer:</p>
                    <p className="text-[13px] font-bold text-slate-600">{profile?.orgName || 'Individual/Personal'}</p>
                </div>
                <p className="text-[13px] text-slate-500 font-medium italic">
                    {formData.shortDescription || 'A community-driven initiative for environmental preservation.'}
                </p>
                <div className="flex items-center gap-4 text-slate-400 font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[11px]">
                            {formData.date ? format(new Date(formData.date), 'MMM dd, yyyy') : 'TBD'}
                            {formData.startTime && ` • ${formData.startTime}`}
                            {formData.endTime && ` - ${formData.endTime}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[11px] truncate max-w-[200px]">{formData.locationName || 'TBD'}</span>
                    </div>
                </div>
            </div>

            <Separator className="bg-slate-100/50" />

            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">About</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed font-normal">
                    {formData.aboutEvent || 'No description provided.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Timeline</h3>
                    <div className="relative pl-5 space-y-6 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-[1px] before:bg-slate-100">
                        {[...formData.timeline]
                            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                            .map((item) => (
                            <div key={item.id} className="relative">
                                <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-500 z-10" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter tabular-nums">{item.time || '00:00 AM'}</span>
                                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{item.activity || 'Activity'}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {formData.requirements.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Requirements</h3>
                        <div className="space-y-2">
                            {formData.requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-2.5 group">
                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <CheckCircle className="w-3 h-3" />
                                    </div>
                                    <span className="text-[12px] text-slate-600 font-bold">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (val) setStep(1); }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] p-0 overflow-hidden border-none shadow-[0_32px_128px_rgba(0,0,0,0.1)] rounded-[32px] bg-white flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
        
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex flex-col gap-4">
            {/* Unique Minimalist Dot Stepper */}
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div key={s} className="relative group">
                    <div
                      className={`h-1.5 transition-all duration-500 rounded-full ${
                        s < step ? 'w-8 bg-primary/40' : 
                        s === step ? 'w-12 bg-primary shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 
                        'w-4 bg-slate-100'
                      }`}
                    />
                    {s === step && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/5 text-primary border-primary/20 tracking-wider">
                {Math.round(progress)}% READY
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/40">Phase 0{step}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{stepTitles[step - 1]}</span>
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
                  {step === 1 && "Start your Journey."}
                  {step === 2 && "The Grand Stage."}
                  {step === 3 && "Defining Time."}
                  {step === 4 && "The Essentials."}
                  {step === 5 && "Visual Identity."}
                  {step === 6 && "Ready to Publish?"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 font-medium">
                    {step === 6 ? "Final look at your event before submission." : "Please provide the following details accurately."}
                </DialogDescription>
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center relative shadow-sm overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
                    >
                        {step === 1 && <Globe className="w-6 h-6 text-primary" />}
                        {step === 2 && <MapPin className="w-6 h-6 text-primary" />}
                        {step === 3 && <Clock className="w-6 h-6 text-primary" />}
                        {step === 4 && <FileText className="w-6 h-6 text-primary" />}
                        {step === 5 && <ImageIcon className="w-6 h-6 text-primary" />}
                        {step === 6 && <CheckCircle className="w-6 h-6 text-primary" />}
                    </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-2 overflow-y-auto flex-1 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              {step === 6 && renderStep6()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="h-12 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {step < 6 ? (
            <Button
              onClick={handleNext}
              className="h-12 px-8 rounded-2xl font-bold bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all hover:translate-y-[-2px] active:scale-95"
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm border-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  Submit Event
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
