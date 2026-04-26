import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/StarRating';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { format } from 'date-fns';

interface EventRating {
  participantId: string;
  name: string;
  photoURL: string | null;
  eventRating: number;
  eventRatingComment: string;
  eventRatingSubmittedAt: string;
}

interface ViewEventRatingsModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEventRatingsModal({ eventId, eventName, isOpen, onClose }: ViewEventRatingsModalProps) {
  const [ratings, setRatings] = useState<EventRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/events/${eventId}/event-ratings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setRatings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch event ratings', err);
        setLoading(false);
      });
    }
  }, [isOpen, eventId]);

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.eventRating, 0) / ratings.length 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-5 bg-slate-50 border-b border-slate-100 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              Event Reviews
            </DialogTitle>
            {ratings.length > 0 && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <span className="font-bold text-sm text-slate-800">{averageRating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            )}
          </div>
          <DialogDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {eventName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3 opacity-60">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <p className="text-sm font-bold text-slate-400">No reviews yet</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {ratings.map((r, i) => (
                <div key={`${r.participantId}-${i}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8 shadow-sm border border-slate-200">
                      {r.photoURL ? <AvatarImage src={r.photoURL} alt={r.name} className="object-cover" /> : null}
                      <AvatarFallback className="bg-amber-50 text-amber-600 font-black text-[10px]">
                        {r.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{r.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {r.eventRatingSubmittedAt ? format(new Date(r.eventRatingSubmittedAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-11">
                    <StarRating value={r.eventRating} readonly size="sm" />
                    {r.eventRatingComment && (
                      <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">
                        "{r.eventRatingComment}"
                      </p>
                    )}
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
