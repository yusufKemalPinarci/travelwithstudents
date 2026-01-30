import { useState } from 'react'
import { CalendarIcon, ClockIcon, UserGroupIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'
import { createBooking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'

interface BookingProposalCardProps {
  bookingData: {
    tourId?: string
    date: string
    time: string
    duration?: string
    participants?: number
    notes?: string
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  }
  messageId: string
  senderId: string
  isMyMessage: boolean
  onAccept?: () => void
  onReject?: () => void
}

export default function BookingProposalCard({ 
  bookingData, 
  messageId, 
  senderId,
  isMyMessage,
  onAccept, 
  onReject 
}: BookingProposalCardProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState(bookingData.status)
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    if (!user || isMyMessage) return
    
    setLoading(true)
    try {
      // Create actual booking
      const booking = await createBooking({
        travelerId: user.id,
        guideId: senderId,
        bookingDate: bookingData.date,
        bookingTime: bookingData.time,
        duration: (bookingData.duration || 'HALF_DAY') as 'HALF_DAY' | 'FULL_DAY',
        notes: bookingData.notes,
      })

      if (booking) {
        setStatus('ACCEPTED')
        onAccept?.()
      }
    } catch (error) {
      console.error('Failed to accept booking:', error)
      alert('Failed to accept booking')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = () => {
    setStatus('REJECTED')
    onReject?.()
  }

  return (
    <div className={`
      rounded-xl p-4 border-2 max-w-sm
      ${status === 'ACCEPTED' ? 'bg-green-50 border-green-300' : 
        status === 'REJECTED' ? 'bg-red-50 border-red-300' : 
        'bg-white border-orange-300'}
    `}>
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="w-5 h-5 text-orange-600" />
        <span className="font-bold text-slate-900">
          {bookingData.tourId ? 'Tour Booking Proposal' : 'Booking Proposal'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-700 mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>{new Date(bookingData.date).toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-slate-400" />
          <span>{bookingData.time}</span>
          {bookingData.duration && (
            <span className="text-xs text-slate-500">({bookingData.duration})</span>
          )}
        </div>

        {bookingData.participants && bookingData.participants > 1 && (
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-slate-400" />
            <span>{bookingData.participants} participants</span>
          </div>
        )}

        {bookingData.notes && (
          <p className="text-xs text-slate-500 italic mt-2 pl-6">
            "{bookingData.notes}"
          </p>
        )}
      </div>

      {status === 'PENDING' && !isMyMessage && (
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            <CheckIcon className="w-4 h-4" />
            Accept
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Decline
          </Button>
        </div>
      )}

      {status === 'ACCEPTED' && (
        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
          ✓ Booking Accepted
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
          ✗ Booking Declined
        </div>
      )}

      {status === 'PENDING' && isMyMessage && (
        <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
          ⏳ Waiting for response...
        </div>
      )}
    </div>
  )
}
