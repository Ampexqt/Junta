import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/StarRating';
import { Loader2, Star } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

interface RatingParticipant {
  participantId: string;
  name: string;
  email: string;
  photoURL: string | null;
  joinedAt: string;
  rating: number | null;
  ratingComment: string;
  ratingSubmittedAt: string | null;
  isEligibleForRating: boolean;
}

interface RateParticipantsModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RateParticipantsModal({ eventId, eventName, isOpen, onClose }: RateParticipantsModalProps) {
  const [participants, setParticipants] = useState<RatingParticipant[]>([]);
  const [ratings, setRatings] = useState<Record<string, { star: number; comment: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/events/${eventId}/ratings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then((data: RatingParticipant[]) => {
          setParticipants(data);
          // Pre-fill existing ratings
          const prefill: Record<string, { star: number; comment: string }> = {};
          data.forEach(p => {
            if (p.rating != null) {
              prefill[p.participantId] = { star: p.rating, comment: p.ratingComment };
            } else {
              prefill[p.participantId] = { star: 0, comment: '' };
            }
          });
          setRatings(prefill);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, eventId]);

  const submitRating = async (participantId: string) => {
    const r = ratings[participantId];
    if (!r || r.star === 0) {
      sileo.error({ title: 'Rating required', description: 'Please select a star rating before submitting.' });
      return;
    }
    setSubmitting(participantId);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/participants/${participantId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: r.star, comment: r.comment })
      });
      if (!res.ok) throw new Error('Failed');
      sileo.success({ title: 'Rating submitted!', description: `${r.star}/5 stars recorded.` });
      // Mark as submitted locally
      setParticipants(prev => prev.map(p =>
        p.participantId === participantId
          ? { ...p, rating: r.star, ratingComment: r.comment, isEligibleForRating: false }
          : p
      ));
    } catch {
      sileo.error({ title: 'Error', description: 'Failed to submit rating.' });
    } finally {
      setSubmitting(null);
    }
  };

  const eligible = participants.filter(p => p.isEligibleForRating);
  const alreadyRated = participants.filter(p => p.rating != null && !p.isEligibleForRating);

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            Rate Participants
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {eventName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[460px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
              <p className="text-sm font-bold text-slate-400">No participants to rate</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {/* Pending ratings */}
              {eligible.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Pending Rating</p>
                  {eligible.map(p => (
                    <div key={p.participantId} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-slate-200">
                          {p.photoURL && <AvatarImage src={p.photoURL} className="object-cover" />}
                          <AvatarFallback className="bg-amber-50 text-amber-600 font-black text-xs">
                            {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400 truncate">{p.email}</p>
                        </div>
                        <Badge className="bg-amber-50 text-amber-600 border-0 text-[9px] font-black uppercase tracking-wider">
                          Pending
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <StarRating
                          value={ratings[p.participantId]?.star || 0}
                          onChange={v => setRatings(prev => ({ ...prev, [p.participantId]: { ...prev[p.participantId], star: v } }))}
                          size="md"
                        />
                        <Textarea
                          placeholder="Add feedback (optional)..."
                          value={ratings[p.participantId]?.comment || ''}
                          onChange={e => setRatings(prev => ({ ...prev, [p.participantId]: { ...prev[p.participantId], comment: e.target.value } }))}
                          className="text-xs min-h-[60px] rounded-xl border-slate-200 resize-none"
                        />
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs h-8 shadow-sm"
                          onClick={() => submitRating(p.participantId)}
                          disabled={submitting === p.participantId}
                        >
                          {submitting === p.participantId
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : 'Submit Rating'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Already rated */}
              {alreadyRated.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Already Rated</p>
                  {alreadyRated.map(p => (
                    <div key={p.participantId} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-slate-200">
                        {p.photoURL && <AvatarImage src={p.photoURL} className="object-cover" />}
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xs">
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        <StarRating value={p.rating || 0} readonly size="sm" />
                        {p.ratingComment && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">"{p.ratingComment}"</p>
                        )}
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[9px] font-black uppercase tracking-wider shrink-0">
                        Rated
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
