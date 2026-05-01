import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api';

interface RateEventModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RateEventModal({ eventId, eventName, isOpen, onClose, onSuccess }: RateEventModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/rate-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit rating');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Rate Event
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            How was your experience at <span className="text-slate-900 font-bold">{eventName}</span>? Your feedback helps organizers improve!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating ? star <= hoveredRating : star <= rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200"
                  )}
                />
              </button>
            ))}
          </div>
          
          <div className="w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Leave a comment (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this event? How could it be improved?"
              className="resize-none h-24 rounded-xl"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-500 w-full text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="sm:justify-between flex-row">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0} 
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              'Submit & Earn 15 XP'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
