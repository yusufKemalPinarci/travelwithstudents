import { useState } from 'react'
import Button from '../components/Button'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'

export default function GuideReviews() {
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const reviews = [
    {
       id: 1,
       name: "Jessica Maccaw",
       avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
       date: "Oct 24, 2023",
       rating: 5,
       tour: "Hidden Gems of Amsterdam",
       comment: "Alex was incredibly knowledgeable and fun! He showed us spots we never would have found on our own. Highly recommend!",
       reply: null 
    },
    {
       id: 2,
       name: "Thomas H.",
       avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
       date: "Sep 12, 2023",
       rating: 4,
       tour: "Historical Walk",
       comment: "Great tour, learned a lot. Alex is very passionate. Just a bit of a fast pace for my parents.",
       reply: "Thanks Thomas! I appreciate the feedback. I'll make sure to adjust the pace for future groups with varying needs. Hope to see you again!"
    },
    {
       id: 3,
       name: "Sarah Jenkins",
       avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
       date: "Aug 05, 2023",
       rating: 5,
       tour: "Foodie Adventure",
       comment: "The best food tour I've ever been on! The stroopwafels were to die for.",
       reply: null
    }
  ];

  const breakdown = [
      { stars: 5, count: 20, pct: 85 },
      { stars: 4, count: 3, pct: 12 },
      { stars: 3, count: 1, pct: 3 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Reviews & Feedback</h1>
          <p className="text-slate-500">See what travelers are saying about your tours.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Summary */}
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-900 mb-4">Rating Overview</h3>
                   <div className="flex items-end gap-3 mb-6">
                       <span className="text-5xl font-black text-slate-900">4.8</span>
                       <div className="mb-2">
                           <div className="flex text-amber-400 gap-0.5">
                               {Array.from({length:5}).map((_, i) => (
                                   <StarIcon key={i} className="w-5 h-5" />
                               ))}
                           </div>
                           <p className="text-xs text-slate-500 font-medium mt-1">Based on 24 reviews</p>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       {breakdown.map((item) => (
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

           {/* Right Column: Reviews List */}
           <div className="lg:col-span-2 space-y-4">
               {reviews.map((review) => (
                   <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                               <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full bg-slate-200" />
                               <div>
                                   <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                                   <p className="text-xs text-slate-400">{review.date} • {review.tour}</p>
                               </div>
                           </div>
                           <div className="flex text-amber-400 gap-0.5">
                                {Array.from({length:5}).map((_, i) => (
                                   i < review.rating ? (
                                       <StarIcon key={i} className="w-4 h-4" />
                                   ) : (
                                       <StarIconOutline key={i} className="w-4 h-4 text-slate-300" />
                                   )
                               ))}
                           </div>
                       </div>
                       
                       <p className="text-slate-700 text-sm leading-relaxed mb-4">
                           "{review.comment}"
                       </p>

                       {review.reply ? (
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                               <p className="text-xs font-bold text-slate-900 mb-1">Your Reply:</p>
                               <p className="text-xs text-slate-600 italic">{review.reply}</p>
                           </div>
                       ) : (
                           <div>
                               {activeReplyId === review.id ? (
                                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                       <textarea 
                                           className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 mb-3"
                                           placeholder="Write a public reply to this review..."
                                           rows={3}
                                           autoFocus
                                       />
                                       <div className="flex justify-end gap-2">
                                           <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                                           <Button size="sm">Post Reply</Button>
                                       </div>
                                   </div>
                               ) : (
                                   <button 
                                       onClick={() => setActiveReplyId(review.id)}
                                       className="text-primary-600 text-xs font-bold flex items-center gap-1 hover:underline"
                                   >
                                       <span className="material-symbols-outlined text-[16px]">reply</span> Reply to review
                                   </button>
                               )}
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </div>
    </div>
  )
}
