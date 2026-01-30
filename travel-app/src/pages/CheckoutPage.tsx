import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { createBooking } from '../api/bookings'
import { createPayment } from '../api/payments'
import Button from '../components/Button'
import ErrorToast from '../components/ErrorToast'
import { CheckCircleIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { guideId, date, time, duration, price, notes, participantCount, isTourBooking, tourId, resetBooking } = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'MOCK' | 'STRIPE' | 'PAYPAL'>('MOCK')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const totalPrice = price * (participantCount || 1)
  const platformFee = totalPrice * (isTourBooking ? 0.1 : 0.15) // 10% for tours, 15% for guides
  const guideEarnings = totalPrice - platformFee

  const handlePayment = async () => {
    if (!user || !guideId || !date || !time) {
      setError('Missing booking information')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // 1. Create booking
      const bookingData: any = {
        travelerId: user.id,
        guideId,
        bookingDate: date,
        bookingTime: time,
        duration: duration || 'HALF_DAY',
        participantCount: participantCount || 1,
        notes: notes || undefined,
      }

      // Tour booking için tourId ekle
      if (isTourBooking && tourId) {
        bookingData.tourId = tourId
      }

      const booking = await createBooking(bookingData)
      
      if (!booking) {
        throw new Error('Failed to create booking')
      }

      // 2. Create payment (ESCROW) - Para sistemde tutuluyor
      const payment = await createPayment({
        bookingId: booking.id,
        amount: totalPrice,
        paymentMethod,
      })

      if (!payment) {
        throw new Error('Payment failed')
      }

      // 3. Success - redirect
      resetBooking()
      navigate(`/booking-success/${booking.id}`, {
        state: {
          booking,
          payment,
          message: isTourBooking 
            ? 'Payment successful! Your tour has been booked.'
            : 'Payment held in escrow. Funds will be released after meeting confirmation.',
        },
      })
    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      {error && (
        <ErrorToast 
          message={error} 
          onClose={() => setError(null)}
        />
      )}
      
      <div className="card-surface p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <LockClosedIcon className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-slate-900">Secure Checkout</h1>
        </div>

        {/* Escrow Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">🔒 Payment Protection</p>
              <p className="text-blue-800">
                Your payment is held securely in escrow. Funds will only be released to the guide after you confirm attendance. 
                If the guide doesn't show up, you'll get a full refund automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Payment Method
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('MOCK')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'MOCK'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-900">Mock Payment (Test)</p>
                  <p className="text-xs text-slate-600">
                    Demo mode - No real payment. Real payments coming soon!
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-700">Credit Card (Stripe)</p>
                  <p className="text-xs text-slate-500">Coming soon</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <div>
                  <p className="font-semibold text-slate-700">PayPal</p>
                  <p className="text-xs text-slate-500">Coming soon</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mock Card Details (for visual only) */}
        {paymentMethod === 'MOCK' && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Demo Card Information
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={3}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <p className="text-xs text-slate-500">
                * This is for demo purposes only. No real payment will be processed.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 my-6" />

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Booking amount</span>
            <span className="font-semibold text-slate-900">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Platform fee ({isTourBooking ? '10%' : '15%'})</span>
            <span className="font-semibold text-slate-900">${platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Guide earnings</span>
            <span className="font-semibold text-green-600">${guideEarnings.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-bold text-slate-900">Total Payment</span>
            <span className="font-bold text-xl text-orange-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Scenarios Info */}
        <div className="bg-slate-50 p-4 rounded-xl mb-6 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">💡 How payments work:</p>
          <ul className="space-y-1 pl-4">
            <li>✅ Both attend → Guide receives ${guideEarnings.toFixed(2)}</li>
            <li>❌ Guide no-show → You get full refund (${totalPrice.toFixed(2)})</li>
            <li>❌ You don't show → Guide receives ${guideEarnings.toFixed(2)}</li>
            <li>❌ Neither shows → Full refund to you</li>
          </ul>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay $${totalPrice.toFixed(2)} (Escrow)`
          )}
        </Button>

        <p className="text-xs text-center text-slate-500 mt-4">
          By completing this purchase you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
