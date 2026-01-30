import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { CheckBadgeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid'
import { FlagIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Button from '../components/Button.tsx'
import RatingStars from '../components/RatingStars.tsx'
import ReportModal from '../components/ReportModal.tsx'
import ReviewModal from '../components/ReviewModal.tsx'
import Avatar from '../components/Avatar'
import { bookings, guideReviews } from '../utils/mockData.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { getGuideById } from '../api/guides'
import { getGuideReviews } from '../api/reviews'
import { getOrCreateConversation } from '../api/messages'
import { getGuideTours } from '../api/tours'
import type { Tour } from '../api/tours'
import { getImageUrl } from '../utils/image'
import type { Guide } from '../types'

export default function GuideProfilePage() {
  const { id } = useParams()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user, isInWishlist, toggleWishlist } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // API'den guide'ı çek
  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return
      setLoading(true)
      const [guideData, reviewsData, toursData] = await Promise.all([
        getGuideById(id),
        getGuideReviews(id, 10, 1),
        getGuideTours(id)
      ])
      setGuide(guideData)
      setReviews(reviewsData.reviews || [])
      setTours(toursData || [])
      setLoading(false)
    }
    fetchGuide()
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Yükleniyor...</p>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Guide bulunamadı.</p>
      </div>
    )
  }

  const isStudentViewingStudent = user?.role === 'Student Guide'
  const saved = isInWishlist(guide.id)

  const hasCompletedTrip = bookings.some(b => b.guideId === guide.id && b.status === 'completed')

  const handleAction = (path: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      navigate('/auth', { state: { from: location.pathname } })
    }
  }

  const handleWishlistToggle = () => {
    if (isAuthenticated) {
      toggleWishlist(guide.id)
    } else {
      navigate('/auth', { state: { from: location.pathname } })
    }
  }

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname } })
      return
    }

    if (!user?.id) {
        console.error("User ID missing")
        return
    }

    // Fallback: If guide.userId is missing, try to find it (or ensure backend sends it)
    const targetUserId = guide.userId; 
    
    if (!targetUserId) {
      console.error('Target User ID (guide.userId) is missing!', guide)
      alert("Cannot verify guide identity for messaging. Please refresh the page.")
      return
    }

    try {
      const conversation = await getOrCreateConversation(user.id, targetUserId)
      if (conversation) {
        navigate(`/messages/${conversation.id}`)
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      alert('Failed to start conversation')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <div className="card-surface p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar 
                src={guide.image ? getImageUrl(guide.image) : undefined}
                alt={guide.name}
                size="lg"
                gender={guide.gender}
                name={guide.name}
              />
              <div>
                {guide.isStudentVerified && (
                  <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Verified student</p>
                      <CheckBadgeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{guide.name}</h1>
                <p className="text-slate-600 dark:text-slate-300">{guide.university} • {guide.city}</p>
                <div className="flex items-center gap-2">
                  {guide.reviews > 0 ? (
                    <RatingStars rating={guide.rating} count={guide.reviews} />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet</p>
                  )}
                  {guide.totalBookings !== undefined && guide.totalBookings > 0 && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">• {guide.totalBookings} {guide.totalBookings === 1 ? 'tour completed' : 'tours completed'}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleWishlistToggle}
                className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-colors"
                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {saved ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-colors"
                title="Report user"
              >
                <FlagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="card-surface p-6 space-y-3">
          <h3 className="section-heading">About</h3>
          <p className="text-slate-600 dark:text-slate-300">
            {guide.bio || "No bio provided."}
          </p>
          
          {/* Social & Verification Badges */}
          <div className="flex flex-wrap gap-4 pt-2">
             {guide.isPhoneVerified && (
                 <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md" title="Phone Number Verified">
                     <DevicePhoneMobileIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" /> Phone Verified
                 </div>
             )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {guide.tags?.map((tag) => (
              <span key={tag} className="pill bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                {tag}
              </span>
            ))}
          </div>
        {tours.length > 0 && (
        <div className="card-surface p-6 space-y-4">
            <h3 className="section-heading">Available Tours</h3>
            <div className="grid gap-4">
                {tours.map(tour => (
                    <Link 
                        key={tour.id} 
                        to={`/tours/${tour.id}`}
                        className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all cursor-pointer group"
                    >
                        {tour.photos && tour.photos.length > 0 ? (
                             <img 
                                src={tour.photos[0].startsWith('http') ? tour.photos[0] : `http://localhost:5000${tour.photos[0]}`} 
                                alt={tour.title} 
                                className="w-24 h-24 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform" 
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em"%3E🗺️%3C/text%3E%3C/svg%3E';
                                }}
                             />
                        ) : (
                             <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center text-3xl border border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform shadow-sm">🗺️</div>
                        )}
                        <div className="flex-1">
                             <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{tour.title}</h4>
                             <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{tour.description}</p>
                             <div className="flex items-center gap-3 text-sm font-medium">
                                <span className="text-orange-600 dark:text-orange-400">${tour.price}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 dark:text-slate-300">{tour.duration} hours</span>
                             </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
        )}

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
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
                 <div className="flex items-center gap-3 mb-2">
                    <img src={review.user?.profileImage || '/default-avatar.png'} alt={review.user?.name || 'User'} className="w-10 h-10 rounded-full" />
                    <div>
                       <p className="font-bold text-slate-900 dark:text-white text-sm">{review.user?.name || 'User'}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                 </div>
                 <RatingStars rating={review.rating} count={0} />
                 <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-slate-500 py-8">Henüz değerlendirme yok</p>
            )}
            {reviews.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full">Read all reviews</Button>
            )}
          </div>
        </div>

        <div className="card-surface p-4 md:p-6 space-y-4">
          <h3 className="section-heading">Portfolio</h3>
          {guide.gallery && guide.gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {guide.gallery.map((photo: string, index: number) => (
                <div key={index} className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img 
                    src={getImageUrl(photo)} 
                    alt={`${guide.name} portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('bg-slate-200');
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No portfolio photos yet</p>
          )}
        </div>
      </div>

      <div className="card-surface h-fit space-y-4 p-5 shadow-card">
        {isStudentViewingStudent ? (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                    🎓
                </div>
                <div>
                    <p className="font-bold text-blue-900 dark:text-blue-300">Student Guide Profile</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                        You are viewing a fellow Student Guide profile. Booking is disabled between guides.
                    </p>
                </div>
            </div>
        ) : (
            <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">From</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">${guide.price} / hour</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request to book with student guide
                  </span>
                </div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Date
                  <input type="date" className="mt-2 w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2.5 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </label>
                <div className="grid grid-cols-[1fr,auto] gap-2">
                    <Button onClick={() => handleAction(`/book/${guide.id}`)} className="text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl">
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Send Request
                    </Button>
                    <Button variant="outline" onClick={handleMessageClick} title="Send a message" className="border-2">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Guide will respond within 72 hours
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
