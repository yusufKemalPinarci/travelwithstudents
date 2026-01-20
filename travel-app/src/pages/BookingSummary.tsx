import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext.tsx'
import { guides } from '../utils/mockData.ts'
import Button from '../components/Button.tsx'
import PriceBreakdown from '../components/PriceBreakdown.tsx'

export default function BookingSummaryPage() {
  const navigate = useNavigate()
  const { guideId, date, time, duration, price, notes, setBookingDetails } = useBooking()
  const guide = guides.find((g) => g.id === guideId)

  if (!guide || !date) {
    // Fallback if accessed directly without state
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
             <p className="text-slate-600">No booking in progress.</p>
             <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="card-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Review your trip</h1>
        
        {/* Trip Details Card */}
        <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
            <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-lg object-cover" />
            <div>
                <h3 className="font-bold text-slate-900">{guide.name} in {guide.city}</h3>
                <p className="text-slate-600 text-sm mt-1">{duration} • {date} at {time}</p>
                 <div className="mt-2 text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded inline-block">
                    {guide.university}
                </div>
            </div>
        </div>

        {/* Notes Input */}
        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message to guide (optional)</label>
            <textarea 
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[100px]"
                placeholder="Introduce yourself or share what you're interested in..."
                value={notes}
                onChange={(e) => setBookingDetails({ notes: e.target.value })}
            />
        </div>

        <div className="border-t border-slate-100 my-6" />

        <PriceBreakdown subtotal={price} />

        <Button onClick={() => navigate('/checkout')} size="lg" className="w-full mt-6">
            Continue to Payment
        </Button>
      </div>
    </div>
  )
}
