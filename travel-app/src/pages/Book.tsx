import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useBooking } from '../context/BookingContext.tsx'
import { guides } from '../utils/mockData'
import CalendarWidget from '../components/CalendarWidget'
import TimeSlotGrid from '../components/TimeSlotGrid'
import Button from '../components/Button'

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM']

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBookingDetails, date, time, duration, resetBooking } = useBooking()
  
  const guide = guides.find((g) => g.id === id)

  // Initialize flow
  useEffect(() => {
    resetBooking()
    if (guide) {
        setBookingDetails({ guideId: guide.id })
    }
  }, [guide, id]) // Warning: resetBooking dependency might cause loop if not stable, but it's from context which usually is stable or wrapping component creates new context.

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
    <div className="mx-auto max-w-5xl py-8">
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        {/* Left: Guide Summary */}
        <div className="space-y-6">
          <div className="card-surface p-6 sticky top-24">
            <h3 className="section-heading mb-4">Booking with</h3>
            
            {/* Trust Tooltip */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                     <p className="text-xs font-bold text-blue-900 uppercase">Pro Tip</p>
                     <p className="text-xs text-blue-700">Guides accept requests 2x faster from verified travelers.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img src={guide.image} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-bold text-slate-900">{guide.name}</p>
                <p className="text-sm text-slate-500">{guide.city}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Rate</span>
                <span className="font-semibold text-slate-900">${guide.price}/hr</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-slate-900">{duration || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-semibold text-slate-900">{date || '-'}</span>
              </div>
               <div className="flex justify-between">
                <span>Time</span>
                <span className="font-semibold text-slate-900">{time || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selection */}
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Select Date & Time</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <CalendarWidget 
                        selectedDate={date} 
                        onDateSelect={(d) => setBookingDetails({ date: d })} 
                    />
                    <div>
                        <p className="font-semibold text-slate-900 mb-3">Available slots</p>
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
                <h2 className="text-xl font-bold text-slate-900">Experience Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Half Day', 'Full Day'].map((type) => (
                         <button
                         key={type}
                         type="button" // Fix: prevent submit
                         onClick={() => setBookingDetails({ duration: type as 'Half Day' | 'Full Day' })}
                         className={`
                           flex items-center justify-between rounded-xl border p-4 text-left transition-all text-slate-900
                           ${
                             duration === type
                               ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                               : 'border-slate-200 bg-white hover:border-primary-200'
                           }
                         `}
                       >
                            <div>
                                <p className={`font-bold ${duration === type ? 'text-primary-800' : 'text-slate-900'}`}>{type}</p>
                                <p className="text-sm text-slate-500">{type === 'Half Day' ? '4 hours' : '8 hours'}</p>
                            </div>
                            <span className="font-semibold text-slate-900">
                                ${(type === 'Half Day' ? 4 : 8) * guide.price}
                            </span>
                       </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button 
                    disabled={!date || !time || !duration} 
                    onClick={handleContinue}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    Continue to Summary
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
