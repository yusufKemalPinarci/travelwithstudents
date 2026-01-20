import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckBadgeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid'
import { FlagIcon } from '@heroicons/react/24/outline'
import Button from '../components/Button.tsx'
import RatingStars from '../components/RatingStars.tsx'
import ReportModal from '../components/ReportModal.tsx'
import ReviewModal from '../components/ReviewModal.tsx'
import { guides, bookings, guideReviews } from '../utils/mockData.ts'
import { useAuth } from '../context/AuthContext.tsx'

export default function GuideProfilePage() {
  const guide = guides[0]
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const isStudentViewingStudent = user?.role === 'Student Guide'

  const hasCompletedTrip = bookings.some(b => b.guideId === guide.id && b.status === 'completed')

  const handleAction = (path: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      navigate('/auth', { state: { from: location.pathname } })
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <div className="card-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={guide.image}
                alt={guide.name}
                className="h-20 w-20 rounded-2xl object-cover"
                loading="lazy"
              />
              <div>
                <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-bold text-blue-600">Verified student</p>
                    <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{guide.name}</h1>
                <p className="text-slate-600">{guide.university} • {guide.city}</p>
                <RatingStars rating={guide.rating} count={guide.reviews} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => handleAction(`/inbox/new?guide=${guide.id}`)}>Message</Button>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors"
                title="Report user"
              >
                <FlagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="card-surface p-6 space-y-3">
          <h3 className="section-heading">About</h3>
          <p className="text-slate-600">
            {guide.bio} I love building itineraries that feel personal and paced for how you like to travel. Expect
            coffee shop stops, hidden courtyards, and a few local snacks.
          </p>
          
          {/* Social & Verification Badges */}
          <div className="flex flex-wrap gap-4 pt-2">
             {guide.isPhoneVerified && (
                 <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md" title="Phone Number Verified">
                     <DevicePhoneMobileIcon className="w-3 h-3 text-slate-500" /> Phone Verified
                 </div>
             )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {guide.tags?.map((tag) => (
              <span key={tag} className="pill bg-primary-50 text-primary-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="section-heading">Reviews</h3>
             {hasCompletedTrip && (
                <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(true)}>
                  Write a Review
                </Button>
             )}
          </div>
          <div className="space-y-6">
            {guideReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                 <div className="flex items-center gap-3 mb-2">
                    <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                    <div>
                       <p className="font-bold text-slate-900 text-sm">{review.author}</p>
                       <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                 </div>
                 <RatingStars rating={review.rating} count={0} />
                 <p className="text-slate-600 mt-2 text-sm">{review.text}</p>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full">Read all reviews</Button>
          </div>
        </div>

        <div className="card-surface p-6 space-y-4">
          <h3 className="section-heading">Portfolio</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface h-fit space-y-4 p-5 shadow-card">
        {isStudentViewingStudent ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                    🎓
                </div>
                <div>
                    <p className="font-bold text-blue-900">Student Guide Profile</p>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                        You are viewing a fellow Student Guide profile. Booking is disabled between guides.
                    </p>
                </div>
            </div>
        ) : (
            <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">From</p>
                    <p className="text-2xl font-bold text-slate-900">${guide.price} / hour</p>
                  </div>
                  <span className="pill bg-accent-50 text-accent-700">Instant book</span>
                </div>
                <label className="block text-sm font-semibold text-slate-700">
                  Date
                  <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <div className="grid grid-cols-[1fr,auto] gap-2">
                    <Button onClick={() => handleAction(`/book/${guide.id}`)} className="text-center">Book now</Button>
                    <Button variant="outline" onClick={() => handleAction(`/inbox/new?guide=${guide.id}&inquiry=true`)} title="Ask a question">
                        <span className="material-symbols-outlined">chat_bubble</span>
                    </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Secure checkout • Free cancellation up to 24 hours before
                </p>
            </>
        )}
      </div>

      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        userName={guide.name}
        onSubmit={(reason: string) => {
          console.log(`Reported ${guide.name} for: ${reason}`)
          setIsReportOpen(false)
        }}
      />
      
      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        guideName={guide.name}
        guideId={guide.id}
        onSubmit={() => {
            setIsReviewOpen(false)
            alert("Thanks for your review!")
        }}
      />
    </div>
  )
}
