import { useState, useEffect } from 'react'
import Button from '../components/Button'
import { StarIcon } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext'
import { getGuideReviews, replyToReview, type Review } from '../api/reviews'
import { getUserProfile } from '../api/auth'
import { formatDistanceToNow } from 'date-fns'

export default function GuideReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    rating: 0,
    total: 0,
    breakdown: [
      { stars: 5, count: 0, pct: 0 },
      { stars: 4, count: 0, pct: 0 },
      { stars: 3, count: 0, pct: 0 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ]
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (user?.id) {
        try {
          const userProfile: any = await getUserProfile(user.id);
          
          if (userProfile && userProfile.guideProfile) {
            const guideId = userProfile.guideProfile.id;
            const data = await getGuideReviews(guideId);
            // getGuideReviews returns { reviews: ... } object based on api/reviews.ts, 
            // but let's check api/reviews.ts again.
            // It returns Promise<{ reviews: Review[]; total: number; totalPages: number }>
            
            const reviewsData = data.reviews || [];
            if(Array.isArray(reviewsData)){
                 setReviews(reviewsData);
            } else {
                 setReviews([]);
            }
            
            if (reviewsData.length > 0) {
              const total = reviewsData.length;
              const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
              const avg = sum / total;
              
              const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
              reviewsData.forEach(r => {
                const rInt = Math.round(r.rating) as 1|2|3|4|5;
                if(counts[rInt] !== undefined) counts[rInt]++;
              });
              
              const breakdown = [
                { stars: 5, count: counts[5], pct: (counts[5] / total) * 100 },
                { stars: 4, count: counts[4], pct: (counts[4] / total) * 100 },
                { stars: 3, count: counts[3], pct: (counts[3] / total) * 100 },
                { stars: 2, count: counts[2], pct: (counts[2] / total) * 100 },
                { stars: 1, count: counts[1], pct: (counts[1] / total) * 100 },
              ];
              
              setStats({
                rating: avg,
                total,
                breakdown
              });
            }
          }
        } catch (error) {
          console.error("Failed to load reviews", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchReviews();
  }, [user?.id]);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    try {
      const updatedReview = await replyToReview(reviewId, replyText);
      if (updatedReview) {
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
        setActiveReplyId(null);
        setReplyText('');
      }
    } catch (error) {
      console.error("Failed to reply", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Reviews & Feedback</h1>
          <p className="text-slate-500">See what travelers are saying about your tours.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-900 mb-4">Rating Overview</h3>
                   <div className="flex items-end gap-3 mb-6">
                       <span className="text-5xl font-black text-slate-900">{stats.rating.toFixed(1)}</span>
                       <div className="mb-2">
                           <div className="flex text-amber-400 gap-0.5">
                               {Array.from({length:5}).map((_, i) => (
                                   <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(stats.rating) ? 'text-amber-400' : 'text-slate-200'}`} />
                               ))}
                           </div>
                           <p className="text-xs text-slate-500 font-medium mt-1">Based on {stats.total} reviews</p>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       {stats.breakdown.map((item) => (
                           <div key={item.stars} className="flex items-center gap-3 text-xs font-medium">
                               <span className="flex items-center gap-1 w-8 text-slate-600">
                                   {item.stars} <StarIcon className="w-3 h-3 text-amber-400" />
                               </span>
                               <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                               </div>
                               <span className="w-6 text-right text-slate-400">{item.count}</span>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           <div className="lg:col-span-2 space-y-4">
               {reviews.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No reviews yet.</p>
                 </div>
               ) : (
                 reviews.map((review) => (
                   <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                               <img 
                                  src={review.traveler?.profileImage || `https://ui-avatars.com/api/?name=${review.traveler?.name || 'Traveler'}&background=random`} 
                                  alt={review.traveler?.name} 
                                  className="w-10 h-10 rounded-full bg-slate-200" 
                               />
                               <div>
                                   <h4 className="font-bold text-slate-900 text-sm">{review.traveler?.name || 'Anonymous'}</h4>
                                   <p className="text-xs text-slate-400">
                                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                      {review.tags && review.tags.length > 0 && ` • ${review.tags.join(', ')}`}
                                   </p>
                               </div>
                           </div>
                           <div className="flex gap-0.5">
                               {Array.from({length:5}).map((_, i) => (
                                   <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                               ))}
                           </div>
                       </div>
                       
                       <p className="text-slate-600 text-sm leading-relaxed mb-4">
                           "{review.comment}"
                       </p>

                       {review.response ? (
                           <div className="bg-slate-50 p-4 rounded-xl text-sm">
                               <p className="font-bold text-slate-900 mb-1">Your Reply:</p>
                               <p className="text-slate-600 italic">{review.response}</p>
                           </div>
                       ) : (
                           <div className="mt-2 text-right">
                               {activeReplyId === review.id ? (
                                   <div className="space-y-3 mt-4 text-left">
                                       <textarea 
                                           className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                           placeholder="Write your response to this review..."
                                           rows={3}
                                           value={replyText}
                                           onChange={(e) => setReplyText(e.target.value)}
                                           autoFocus
                                       />
                                       <div className="flex justify-end gap-2">
                                           <Button 
                                             size="sm" 
                                             variant="ghost" 
                                             onClick={() => {
                                               setActiveReplyId(null);
                                               setReplyText('');
                                             }}
                                           >
                                               Cancel
                                           </Button>
                                           <Button 
                                             size="sm" 
                                             onClick={() => handleReplySubmit(review.id)}
                                             loading={submitting}
                                           >
                                               Post Reply
                                           </Button>
                                       </div>
                                   </div>
                               ) : (
                                   <button 
                                      onClick={() => setActiveReplyId(review.id)}
                                      className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-1 ml-auto"
                                   >
                                       <span className="material-symbols-outlined text-[16px]">reply</span> Reply to review
                                   </button>
                               )}
                           </div>
                       )}
                   </div>
                 ))
               )}
           </div>
       </div>
    </div>
  )
}
