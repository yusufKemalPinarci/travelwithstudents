import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext.tsx'
import Button from '../components/Button.tsx'
import PaymentMethodSelector from '../components/PaymentMethodSelector.tsx'
import CreditCardForm from '../components/CreditCardForm.tsx'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { price, resetBooking } = useBooking()
  const [method, setMethod] = useState<'card' | 'apple' | 'google'>('card')
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    resetBooking()
    alert('Payment successful! Redirecting to your trips...')
    navigate('/trips')
  }

  // Calculate total with fees again or persist it. 
  // Ideally context holds final total, but for now re-calc or just use price base
  const total = Math.round(price * 1.18) // simple re-calc matching Summary logic

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
        <p className="text-slate-500">Choose how you'd like to pay.</p>
      </div>

      <PaymentMethodSelector method={method} onChange={setMethod} />

      {method === 'card' && <CreditCardForm />}

      <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-800 flex gap-3 items-start">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
        <p>Your payment information is encrypted and secure. You'll strictly be charged only after the guide confirms your booking.</p>
      </div>

      <Button 
        onClick={handlePay} 
        size="lg" 
        className="w-full flex justify-between items-center px-6"
        disabled={loading}
      >
        <span>{loading ? 'Processing...' : 'Pay securely'}</span>
        {!loading && <span>${total}</span>}
      </Button>
    </div>
  )
}
