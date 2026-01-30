import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useBooking } from '../context/BookingContext.tsx'
import { getGuideById } from '../api/guides'
import { createBookingRequest } from '../api/bookingRequests'
import Button from '../components/Button.tsx'
import PriceBreakdown from '../components/PriceBreakdown.tsx'

export default function BookingSummaryPage() {
  const navigate = useNavigate()
  const { guideId, date, time, duration, price, notes, setBookingDetails, isTourBooking, tourId, participantCount } = useBooking()
  const [guide, setGuide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchGuide = async () => {
      if (!guideId) {
        setLoading(false)
        return
      }
      const data = await getGuideById(guideId)
      setGuide(data)
      setLoading(false)
    }
    fetchGuide()
  }, [guideId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!guide || !date) {
    // Fallback if accessed directly without state
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
             <p className="text-slate-600">No booking in progress.</p>
             <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
    )
  }

  // Format date nicely
  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return d.toLocaleDateString('en-US', options)
  }

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center">
            {isTourBooking ? (
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isTourBooking ? 'Confirm Your Booking' : 'Review Your Request'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isTourBooking ? `Book tour with ${guide.name}` : `Send booking request to ${guide.name}`}
            </p>
          </div>
        </div>
        
        {/* Info Banner */}
        {isTourBooking ? (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-green-900 dark:text-green-300 mb-1">Instant Booking</p>
                <p className="text-green-700 dark:text-green-400">Your spot will be confirmed immediately after payment. No waiting for approval!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">No payment required yet</p>
                <p className="text-blue-700 dark:text-blue-400">Your request will be sent to {guide.name}. You'll only be charged if they accept within 72 hours.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Trip Details Card */}
        <div className="flex gap-6 p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-700 dark:to-slate-600 border-2 border-orange-200 dark:border-orange-900/30 mb-8 shadow-sm">
            {guide.image ? (
              <img 
                src={guide.image.startsWith('http') ? guide.image : `http://localhost:5000${guide.image}`} 
                alt={guide.name} 
                className="w-24 h-24 rounded-xl object-cover shadow-md border-2 border-white dark:border-slate-800" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-3xl font-bold">
                        ${guide.name.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-3xl font-bold">
                {guide.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {guide.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-1 mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {guide.city}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {time}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {duration}
                  </span>
                </div>
                 <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-orange-200 dark:border-orange-900/30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {guide.university}
                </div>
            </div>
        </div>

        {/* Notes Input - Only for guide bookings */}
        {!isTourBooking && (
          <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Message to {guide.name} (optional)
              </label>
              <textarea 
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-4 text-sm focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[120px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Introduce yourself or share what you're interested in..."
                  value={notes}
                  onChange={(e) => setBookingDetails({ notes: e.target.value })}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                💡 Tip: Personalized messages get accepted 3x faster!
              </p>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 my-8" />

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {isTourBooking ? 'Total Cost' : 'Estimated Cost'}
          </h3>
          <PriceBreakdown subtotal={price} />
          {!isTourBooking && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              No payment will be charged until {guide.name} accepts your request
            </p>
          )}
        </div>

        <Button 
          onClick={async () => {
            if (isTourBooking) {
              // For tours: Go directly to payment
              navigate('/checkout')
            } else {
              // For guide bookings: Send request
              try {
                setSending(true)
                await createBookingRequest({
                  guideId: guideId!,
                  bookingDate: date!,
                  bookingTime: time!,
                  duration: duration! as 'HALF_DAY' | 'FULL_DAY',
                  participantCount: 1,
                  message: notes || undefined
                })
                setShowSuccessModal(true)
              } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to send request. Please try again.')
              } finally {
                setSending(false)
              }
            }
          }} 
          size="lg" 
          disabled={sending}
          className="w-full py-4 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <svg className="w-5 h-5 inline-block mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : isTourBooking ? (
            <>
              <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Continue to Payment
            </>
          ) : (
            <>
              <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Request to {guide.name}
            </>
          )}
        </Button>
        
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          {isTourBooking 
            ? 'By proceeding to payment, you agree to our booking policies'
            : 'By sending this request, you agree to our booking policies'
          }
        </p>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Request Sent!</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your booking request has been sent to student guide <span className="font-semibold text-orange-600 dark:text-orange-400">{guide.name}</span>.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-left">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">What happens next?</p>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{guide.name} has 72 hours to respond</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>You'll receive a notification when they accept</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>View your request status in "My Requests"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-requests')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                View My Requests
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
