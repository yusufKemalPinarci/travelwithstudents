import { useState } from 'react'
import { bookings as initialBookings } from '../utils/mockData.ts'
import BookingCard from '../components/BookingCard.tsx'
import ReviewModal from '../components/ReviewModal.tsx'
import CancellationModal from '../components/CancellationModal.tsx'
import type { Booking, BookingStatus } from '../types.ts'

const tabs: { id: BookingStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Trips' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
]

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')
  const [bookings, setBookings] = useState<Booking[]>(initialBookings) 
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null)

  const filteredBookings = bookings.filter(
      (b) => activeTab === 'all' || b.status === activeTab
  )

  const handleReviewSubmit = () => {
    if (reviewBooking) {
      setBookings(prev => prev.map(b => b.id === reviewBooking.id ? { ...b, hasReview: true } : b))
      setReviewBooking(null)
      alert("Thanks for your feedback!")
    }
  }

  const handleCancelConfirm = () => {
    if (cancelBooking) {
        setBookings(prev => prev.map(b => b.id === cancelBooking.id ? { ...b, status: 'cancelled' } : b))
        setCancelBooking(null)
        alert("Booking cancelled successfully.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">My Trips</h1>
          
          <div className="border-b border-slate-200">
             <div className="flex gap-6 overflow-x-auto pb-px">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors
                            ${
                                activeTab === tab.id
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
          </div>
      </div>

      <div className="grid gap-4 px-4 sm:px-0">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard 
                key={booking.id} 
                booking={booking} 
                onReview={(b) => setReviewBooking(b)}
                onCancel={(b) => setCancelBooking(b)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">flight_off</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No trips found</h3>
            <p className="text-slate-500 text-sm">You haven't booked any trips in this category yet.</p>
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
            isOpen={!!reviewBooking}
            onClose={() => setReviewBooking(null)}
            guideName={reviewBooking.guide.name}
            guideId={reviewBooking.guideId}
            bookingId={reviewBooking.id}
            onSubmit={handleReviewSubmit}
        />
      )}

      {cancelBooking && (
        <CancellationModal
            isOpen={!!cancelBooking}
            onClose={() => setCancelBooking(null)}
            booking={cancelBooking}
            onConfirm={handleCancelConfirm}
        />
      )}
    </div>
  )
}
