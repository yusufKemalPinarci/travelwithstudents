import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useBooking } from '../context/BookingContext.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { getGuideById } from '../api/guides'
import CalendarWidget from '../components/CalendarWidget'
import TimeSlotGrid from '../components/TimeSlotGrid'
import Button from '../components/Button'

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM']

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setBookingDetails, date, time, duration, resetBooking } = useBooking()
  
  const [guide, setGuide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showGuideWarning, setShowGuideWarning] = useState(false)
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false)

  // Fetch guide
  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return
      const data = await getGuideById(id)
      setGuide(data)
      setLoading(false)
    }
    fetchGuide()
  }, [id])

  // Initialize flow & Check permissions
  useEffect(() => {
    resetBooking()
    if (guide) {
        if (user?.role === 'STUDENT_GUIDE' && !hasCheckedPermission) {
            setShowGuideWarning(true)
            setHasCheckedPermission(true)
        } else {
            setBookingDetails({ 
              guideId: guide.id,
              isTourBooking: false // This is a guide booking, needs request
            })
        }
    }
  }, [guide, user, hasCheckedPermission])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!guide) return <div>Guide not found</div>

  const handleContinue = () => {
    if (date && time && duration) {
        const hourly = guide.price
        const hours = duration === 'Half Day' ? 4 : 8
        const total = hourly * hours
        setBookingDetails({ price: total })
        navigate('/book/summary')
    }
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guides Cannot Book Other Guides</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  As a student guide, you can create your own tours and be booked by travelers, but you cannot book other guides.
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px,1fr]">
        {/* Left: Guide Summary */}
        <div className="space-y-6">
          <div className="card-surface p-6 sticky top-24">
            <h3 className="section-heading mb-4">Request Details</h3>
            
            {/* Trust Tooltip */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                     <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase">Pro Tip</p>
                     <p className="text-xs text-blue-700 dark:text-blue-400">Student guides accept requests 2x faster from verified travelers.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {guide.image ? (
                <div className="relative">
                  <img 
                    src={guide.image.startsWith('http') ? guide.image : `http://localhost:5000${guide.image}`}
                    alt={guide.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800 shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-200 dark:border-orange-800 shadow-md flex items-center justify-center text-white text-xl font-bold">
                            ${guide.name.charAt(0).toUpperCase()}
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-200 dark:border-orange-800 shadow-md flex items-center justify-center text-white text-xl font-bold">
                  {guide.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{guide.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{guide.city}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">${guide.price}/hr</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-slate-900 dark:text-white">{duration || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">{date || '-'}</span>
              </div>
               <div className="flex justify-between">
                <span>Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">{time || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection */}
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send Booking Request</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {guide.name} will respond within 72 hours. No payment required until accepted.
                </p>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Date & Time</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <CalendarWidget 
                        selectedDate={date} 
                        onDateSelect={(d) => setBookingDetails({ date: d })} 
                    />
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-3">Available slots</p>
                         {date ? (
                             <TimeSlotGrid 
                                slots={timeSlots} 
                                selectedSlot={time} 
                                onSlotSelect={(t) => setBookingDetails({ time: t })}
                             />
                         ) : (
                             <p className="text-slate-500 text-sm">Please select a date first.</p>
                         )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Experience Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Half Day', 'Full Day'].map((type) => (
                         <button
                         key={type}
                         type="button"
                         onClick={() => setBookingDetails({ duration: type as 'Half Day' | 'Full Day' })}
                         className={`
                           flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all
                           ${
                             duration === type
                               ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500/20 shadow-md'
                               : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                           }
                         `}
                       >
                            <div>
                                <p className={`font-bold ${duration === type ? 'text-orange-700 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>{type}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{type === 'Half Day' ? '4 hours' : '8 hours'}</p>
                            </div>
                            <span className={`font-semibold text-lg ${duration === type ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                                ${(type === 'Half Day' ? 4 : 8) * guide.price}
                            </span>
                       </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                    disabled={!date || !time || !duration} 
                    onClick={handleContinue}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Request to {guide.name}
                </Button>
                {!date || !time || !duration ? (
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Please select date, time, and duration to continue
                    </p>
                ) : (
                    <p className="text-xs text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ready to send request
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
    </>
  )
}
