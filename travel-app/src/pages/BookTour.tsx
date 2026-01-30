import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useBooking } from '../context/BookingContext.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { getTourById, type Tour } from '../api/tours'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { getImageUrl } from '../utils/image'
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function BookTourPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setBookingDetails, resetBooking } = useBooking()
  
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [participantCount, setParticipantCount] = useState(1)
  const [showGuideWarning, setShowGuideWarning] = useState(false)
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false)

  // Fetch tour
  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return
      try {
        const data = await getTourById(id)
        setTour(data)
      } catch (error) {
        console.error('Failed to fetch tour:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTour()
  }, [id])

  // Initialize flow & Check permissions
  useEffect(() => {
    resetBooking()
    if (tour && user?.role === 'STUDENT_GUIDE' && !hasCheckedPermission) {
      setShowGuideWarning(true)
      setHasCheckedPermission(true)
    }
  }, [tour, user, hasCheckedPermission])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Tour not found</p>
        <Button onClick={() => navigate('/tours')} variant="ghost" className="mt-4">
          Browse all tours
        </Button>
      </div>
    )
  }

  const handleContinue = () => {
    if (participantCount > tour!.availableSlots) {
      alert(`Only ${tour!.availableSlots} slots available for this tour`);
      return;
    }
    // Set booking details for tour
    setBookingDetails({ 
      guideId: tour!.guideId,
      price: tour!.price * participantCount,
      participantCount,
      date: tour!.tourDate || null,
      time: tour!.tourTime || null,
      duration: null, // Tours don't have duration like guide bookings
      notes: '',
      isTourBooking: true, // Flag for instant booking
      tourId: tour!.id
    });
    // Direkt ödeme sayfasına yönlendir (tour için)
    navigate('/checkout')
  }

  return (
    <>
      {/* Guide Warning Modal */}
      {showGuideWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">🎓</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guides Cannot Book Tours</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  As a student guide, you can create and offer tours, but you cannot book tours as a traveler.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowGuideWarning(false)
                navigate('/guide/dashboard')
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px,1fr]">
        {/* Left: Tour & Guide Summary */}
        <div className="space-y-6">
          <div className="card-surface p-6 sticky top-24 space-y-4">
            <h3 className="section-heading mb-4">Booking</h3>
            
            {/* Trust Tooltip */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                     <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase">Pro Tip</p>
                     <p className="text-xs text-blue-700 dark:text-blue-400">Student guides accept requests 2x faster from verified travelers.</p>
                </div>
            </div>

            {/* Tour Info */}
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tour.title}</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">📍</span>
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">⏱️</span>
                  <span>{tour.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">💬</span>
                  <span>{tour.language}</span>
                </div>
              </div>
            </div>

            {/* Guide Info */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar 
                src={tour.guide.user.profileImage ? getImageUrl(tour.guide.user.profileImage) : undefined} 
                size="lg" 
                name={tour.guide.user.name}
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{tour.guide.user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Student Guide</p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Price per person</span>
                <span className="font-semibold text-slate-900 dark:text-white">${tour.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-slate-900 dark:text-white">{tour.duration}h</span>
              </div>
              {tour.tourDate && (
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(tour.tourDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {tour.tourTime && (
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tour.tourTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Participants</span>
                <span className="font-semibold text-slate-900 dark:text-white">{participantCount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">${(tour.price * participantCount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection */}
        <div className="space-y-8">
            {/* Tour Info Banner */}
            <div className="card-surface p-6 space-y-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{tour.title}</h2>
                <p className="text-slate-600 dark:text-slate-400">{tour.description}</p>
                {tour.tourDate && tour.tourTime && (
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CalendarIcon className="w-5 h-5" />
                      <span>{new Date(tour.tourDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <ClockIcon className="w-5 h-5" />
                      <span>{tour.tourTime}</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Participants */}
            <div className="card-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Number of Participants</h3>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        {tour.availableSlots} slots available
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                        className="w-12 h-12 rounded-xl border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xl font-bold hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={tour.availableSlots}
                        value={participantCount}
                        onChange={(e) => setParticipantCount(Math.min(tour.availableSlots, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-24 text-center text-3xl font-bold border-2 border-slate-300 dark:border-slate-600 rounded-xl py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-transparent"
                    />
                    <button
                        onClick={() => setParticipantCount(Math.min(tour.availableSlots, participantCount + 1))}
                        disabled={participantCount >= tour.availableSlots}
                        className="w-12 h-12 rounded-xl border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xl font-bold hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>
                {participantCount >= tour.availableSlots && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-3 rounded-lg text-sm font-medium">
                        ⚠️ Maximum capacity reached for this tour
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button 
                    onClick={handleContinue}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    Continue to Payment
                </Button>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}
