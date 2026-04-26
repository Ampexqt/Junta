import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { format } from 'date-fns';

interface Participant {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  joinedAt: string;
  status: string;
}

interface ViewParticipantsModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewParticipantsModal({ eventId, eventName, isOpen, onClose }: ViewParticipantsModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/events/${eventId}/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setParticipants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch participants', err);
        setLoading(false);
      });
    }
  }, [isOpen, eventId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-5 bg-slate-50 border-b border-slate-100 flex flex-col space-y-1.5">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
               <Users className="w-4 h-4" />
            </div>
            Participants List
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {eventName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3 opacity-60">
              <Users className="w-12 h-12 text-slate-200" />
              <p className="text-sm font-bold text-slate-400">No participants yet</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                  <Avatar className="w-10 h-10 shadow-sm border border-slate-200">
                    {p.photoURL ? <AvatarImage src={p.photoURL} alt={p.name} className="object-cover" /> : null}
                    <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xs">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{p.name}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{p.email}</p>
                  </div>
                  <div className="text-right pl-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Joined</p>
                    <p className="text-xs font-bold text-slate-600">
                      {p.joinedAt ? format(new Date(p.joinedAt), 'MMM d, yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
