import type { Booking } from '../types.ts'
import Button from './Button.tsx'

type BookingCardProps = {
  booking: Booking
  onReview?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
}

const statusColors = {
  upcoming: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-100 text-slate-800',
  cancelled: 'bg-red-100 text-red-800',
}

const BookingCard = ({ booking, onReview, onCancel }: BookingCardProps) => {
  return (
    <div className="card-surface p-0 flex flex-col sm:flex-row overflow-hidden">
      <div className="w-full sm:w-48 h-48 sm:h-auto relative">
        <img
            src={booking.guide.image}
            alt={booking.guide.name}
            className="w-full h-full object-cover"
        />
        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded capitalize ${statusColors[booking.status]}`}>
            {booking.status}
        </span>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
         <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                     <h3 className="font-bold text-lg text-slate-900">Tour with {booking.guide.name}</h3>
                     <p className="text-slate-600">{booking.date} • {booking.time}</p>
                </div>
                <span className="font-bold text-slate-900">${booking.price}</span>
            </div>
            <div className="flex gap-2">
                 <span className="pill bg-slate-50 text-slate-600 border border-slate-200">
                    {booking.duration}
                 </span>
                 <span className="pill bg-slate-50 text-slate-600 border border-slate-200">
                    {booking.guide.city}
                 </span>
            </div>
         </div>

         <div className="flex gap-3 mt-6 justify-end border-t border-slate-100 pt-4">
             {booking.status === 'upcoming' && (
                 <>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-transparent"
                        onClick={() => onCancel?.(booking)}
                    >
                        Cancel
                    </Button>
                    <Button variant="secondary" size="sm">
                        Manage Booking
                    </Button>
                 </>
             )}
             {booking.status === 'cancelled' && (
                 <Button variant="outline" size="sm">
                     Rebook
                 </Button>
             )}
              {booking.status === 'completed' && !booking.hasReview && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="!text-orange-600 !border-orange-200 hover:!bg-orange-50"
                    onClick={() => onReview?.(booking)}
                  >
                    Rate & Review
                  </Button>
             )}
         </div>
      </div>
    </div>
  )
}

export default BookingCard
