import { useState } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from './Button';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  guideName: string;
  guideId?: string;
  bookingId?: string;
  onSubmit?: (data: any) => void;
}

const TAGS = ['Friendly', 'Knowledgeable', 'Good English', 'Punctual', 'Fun', 'Local Expert'];

export default function ReviewModal({ isOpen, onClose, guideName, guideId, bookingId, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    setTimeout(() => {
        setIsSubmitting(false);
        const reviewData = { rating, review, tags: selectedTags, guideId, bookingId };
        console.log('Submitted review:', reviewData);
        if (onSubmit) {
            onSubmit(reviewData); 
        } else {
            onClose(); // Fallback if no onSubmit provided
        }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
           <h2 className="text-xl font-bold text-slate-900">How was your trip with {guideName}?</h2>
           <p className="text-slate-500 text-sm">Your feedback helps others find great guides.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           {/* Star Rating */}
           <div className="flex justify-center gap-2">
               {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(star)}
                     className="focus:outline-none transition-transform hover:scale-110"
                   >
                       <StarIcon className={`w-10 h-10 ${
                           star <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-200'
                       }`} />
                   </button>
               ))}
           </div>

           {/* Tags */}
           <div className="flex flex-wrap gap-2 justify-center">
               {TAGS.map(tag => (
                   <button
                     key={tag}
                     type="button"
                     onClick={() => toggleTag(tag)}
                     className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                         selectedTags.includes(tag) 
                         ? 'bg-primary-50 text-primary-700 border-primary-200' 
                         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                     }`}
                   >
                       {tag}
                   </button>
               ))}
           </div>

           {/* Text Area */}
           <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Share your experience</label>
               <textarea
                 rows={4}
                 value={review}
                 onChange={(e) => setReview(e.target.value)}
                 placeholder="What did you enjoy the most?"
                 className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500"
               />
           </div>

           <Button fullWidth disabled={rating === 0 || isSubmitting}>
               {isSubmitting ? 'Submitting...' : 'Submit Review'}
           </Button>
        </form>
      </div>
    </div>
  );
}
