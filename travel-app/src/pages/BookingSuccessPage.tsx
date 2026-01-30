import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Button from '../components/Button'
import { confirmAttendance, getPaymentByBooking } from '../api/payments'
import { useAuth } from '../context/AuthContext'

export default function BookingSuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false)

  const booking = location.state?.booking
  const payment = location.state?.payment
  const message = location.state?.message

  const handleConfirmAttendance = async (attended: boolean) => {
    if (!bookingId) return

    setLoading(true)
    try {
      await confirmAttendance(bookingId, attended)
      setAttendanceConfirmed(true)
      alert(
        attended
          ? 'Thank you for confirming! Payment will be processed accordingly.'
          : 'Noted. Refund will be processed if applicable.'
      )
    } catch (error) {
      console.error('Error confirming attendance:', error)
      alert('Failed to confirm attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600 mb-4">Your payment is secured in escrow</p>
          
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              {message}
            </div>
          )}
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <span>{new Date(booking.bookingDate || booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                <span>{booking.bookingTime || booking.time}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <span className="text-slate-600">Duration:</span>
                <span className="font-semibold">{booking.duration}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <span className="text-slate-600">Total Paid:</span>
                <span className="font-bold text-orange-600">${booking.totalPrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Confirmation (Show after booking date) */}
        {booking && new Date(booking.bookingDate || booking.date) < new Date() && !attendanceConfirmed && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-bold text-lg text-slate-900 mb-4">
              📍 Confirm Attendance
            </h2>
            <p className="text-slate-600 mb-4">
              Did you meet with your guide? Your confirmation helps us process the payment correctly.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleConfirmAttendance(true)}
                disabled={loading}
                className="flex-1"
              >
                ✅ Yes, We Met
              </Button>
              <Button
                onClick={() => handleConfirmAttendance(false)}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                ❌ Didn't Meet
              </Button>
            </div>
          </div>
        )}

        {/* Payment Protection Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-3">🔒 Payment Protection</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p>Your money is held securely until after the meeting</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p>If guide doesn't show up, you get a full refund</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <p>Guide only receives payment after successful meeting</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/trips')}
            variant="outline"
            className="flex-1"
          >
            View My Bookings
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>

        {/* Payment Scenarios Info */}
        <div className="mt-6 bg-slate-100 rounded-lg p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-2">How it works:</p>
          <ul className="space-y-1 pl-4">
            <li><strong>Both attend:</strong> Guide receives payment (minus 10% fee)</li>
            <li><strong>Guide no-show:</strong> Full refund to you</li>
            <li><strong>You don't show:</strong> Guide receives payment</li>
            <li><strong>Neither shows:</strong> Full refund to you</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
