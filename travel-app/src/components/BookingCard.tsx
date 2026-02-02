import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Booking } from '../types.ts'
import Button from './Button.tsx'
import { confirmAttendance } from '../api/bookings.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { useError } from '../context/ErrorContext.tsx'

type BookingCardProps = {
  booking: Booking
  onReview?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
  onAttendanceConfirmed?: () => void
  onVerifyQR?: (bookingId: string) => void
}

const statusColors = {
  upcoming: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-100 text-slate-800',
  cancelled: 'bg-red-100 text-red-800',
}

const BookingCard = ({ booking, onReview, onCancel, onAttendanceConfirmed }: BookingCardProps) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError } = useError()
  const [isConfirming, setIsConfirming] = useState(false)
  
  // Hide pending bookings from Trips view (they should be in My Requests)
  if (booking.status === 'pending') {
    return null
  }
  
  // Check if booking date has passed (tour is completed but needs confirmation)
  const isPastDate = () => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate < today
  }

  // Check if user needs to confirm attendance
  const needsAttendanceConfirmation = () => {
    if (!isPastDate()) return false
    if (booking.status === 'cancelled') return false
    
    const isGuide = user?.role === 'STUDENT_GUIDE'
    const userConfirmed = isGuide ? booking.guideAttendance : booking.travelerAttendance
    
    return !userConfirmed
  }

  // Check if waiting for other party
  const waitingForOtherParty = () => {
    if (!isPastDate()) return false
    
    const isGuide = user?.role === 'STUDENT_GUIDE'
    const userConfirmed = isGuide ? booking.guideAttendance : booking.travelerAttendance
    const otherConfirmed = isGuide ? booking.travelerAttendance : booking.guideAttendance
    
    return userConfirmed && !otherConfirmed
  }

  const handleConfirmAttendance = async () => {
    setIsConfirming(true)
    try {
      const result = await confirmAttendance(booking.id)
      if (result.success) {
        showError(result.message)
        onAttendanceConfirmed?.()
      } else {
        showError(result.message)
      }
    } catch (error) {
      showError('Failed to confirm attendance')
    } finally {
      setIsConfirming(false)
    }
  }
  
  // Default avatar with gradient
  const getDefaultAvatar = () => {
    const firstLetter = booking.guide.name.charAt(0).toUpperCase()
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-6xl font-bold">
        {firstLetter}
      </div>
    )
  }
  
  // Get image URL - prioritize tour image if available, otherwise guide image
  const getImageUrl = () => {
    // Check if this is a tour booking with photos
    if ((booking as any).tour?.photos && (booking as any).tour.photos.length > 0) {
      const tourPhoto = (booking as any).tour.photos[0]
      return tourPhoto.startsWith('http') 
        ? tourPhoto 
        : `http://localhost:5000${tourPhoto}`
    }
    
    // Fallback to guide image
    if (booking.guide?.image) {
      return booking.guide.image.startsWith('http') 
        ? booking.guide.image 
        : `http://localhost:5000${booking.guide.image}`
    }
    
    return null
  }
  
  const imageUrl = getImageUrl()
  
  return (
    <div className="card-surface p-0 flex flex-col sm:flex-row overflow-hidden">
      <div 
        className="w-full sm:w-48 h-48 sm:h-auto relative cursor-pointer hover:opacity-90 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          if (booking.guide?.id) {
            navigate(`/guide/${booking.guide.id}`)
          }
        }}
        title={`View ${booking.guide.name}'s profile`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={(booking as any).tour?.title || booking.guide.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const parent = e.currentTarget.parentElement
              if (parent && !parent.querySelector('.default-avatar')) {
                const div = document.createElement('div')
                div.className = 'default-avatar w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-6xl font-bold'
                div.textContent = booking.guide.name.charAt(0).toUpperCase()
                parent.appendChild(div)
              }
            }}
          />
        ) : (
          getDefaultAvatar()
        )}
        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded capitalize ${statusColors[booking.status]}`}>
            {booking.status}
        </span>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
         <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                     <h3 
                       className="font-bold text-lg text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation()
                         if (booking.guide?.id) {
                           navigate(`/guide/${booking.guide.id}`)
                         }
                       }}
                     >
                       {(booking as any).tour?.title || `Tour with ${booking.guide.name}`}
                     </h3>
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

            {/* Attendance confirmation status */}
            {isPastDate() && booking.status !== 'cancelled' && (
              <div className="mt-4 space-y-2">
                {needsAttendanceConfirmation() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800 font-medium">
                      ✓ Please confirm that this tour was completed
                    </p>
                  </div>
                )}
                {waitingForOtherParty() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ You confirmed. Waiting for the other party to confirm.
                    </p>
                  </div>
                )}
                {booking.travelerAttendance && booking.guideAttendance && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-sm text-emerald-800 font-medium">
                      ✓ Both parties confirmed. Payment has been released!
                    </p>
                  </div>
                )}
              </div>
            )}
         </div>

         <div className="flex gap-3 mt-6 justify-end border-t border-slate-100 pt-4">
             {booking.status === 'upcoming' && (
                 <>
                    {onVerifyQR && (
                           <Button 
                             variant="secondary" 
                             size="sm"
                             className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                             onClick={() => onVerifyQR(booking.id)}
                           >
                             Verify QR
                           </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-transparent"
                        onClick={() => onCancel?.(booking)}
                    >
                        Cancel
                    </Button>
                 </>
             )}
             {booking.status === 'cancelled' && (
                 <Button variant="outline" size="sm">
                     Rebook
                 </Button>
             )}
             {needsAttendanceConfirmation() && (
               <Button 
                 variant="primary" 
                 size="sm"
                 onClick={handleConfirmAttendance}
                 disabled={isConfirming}
               >
                 {isConfirming ? 'Confirming...' : 'Confirm Tour Completed'}
               </Button>
             )}
              {booking.status === 'completed' && !booking.hasReview && booking.travelerAttendance && booking.guideAttendance && (
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
