import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RideRatingProps {
  bookingId: string;
  driverId?: string;
  routeName?: string;
  isOpen: boolean;
  onClose: () => void;
  onRated: () => void;
}

const RideRating = ({ bookingId, driverId, routeName, isOpen, onClose, onRated }: RideRatingProps) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const labels = lang === 'ar'
    ? ['', 'سيء', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز']
    : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const submit = async () => {
    if (!user || !rating) return;
    setSubmitting(true);
    const { error } = await supabase.from('ratings').insert({
      booking_id: bookingId,
      user_id: user.id,
      driver_id: driverId || null,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: lang === 'ar' ? 'شكراً لتقييمك!' : 'Thanks for your rating!' });
    onRated();
    onClose();
    setRating(0);
    setComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {lang === 'ar' ? 'قيّم رحلتك' : 'Rate Your Ride'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {routeName && (
            <p className="text-center text-sm text-muted-foreground">{routeName}</p>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredStar || rating)
                      ? 'fill-secondary text-secondary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Label */}
          {(hoveredStar || rating) > 0 && (
            <p className="text-center text-sm font-medium text-foreground">
              {labels[hoveredStar || rating]}
            </p>
          )}

          {/* Comment */}
          <Textarea
            placeholder={lang === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a comment (optional)...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={submit}
              disabled={!rating || submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
              {lang === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {lang === 'ar' ? 'لاحقاً' : 'Later'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RideRating;
