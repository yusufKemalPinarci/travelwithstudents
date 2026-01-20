import { useState, useEffect } from 'react'
import { DevicePhoneMobileIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import Button from './Button'

export default function PhoneVerificationCard() {
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('+1')
  const [step, setStep] = useState<'input' | 'otp' | 'verified'>('input')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(59)

  useEffect(() => {
    let interval: any
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  const handleSendCode = () => {
    if (phone.length > 5) {
      setStep('otp')
      setTimer(59)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }

    // Check completion
    if (newOtp.join('').length === 6) {
        // Mock verify
        if(newOtp.join('') === '123456') {
            setTimeout(() => setStep('verified'), 500)
        }
    }
  }

  if (step === 'verified') {
    return (
      <div className="card-surface p-6 flex items-center gap-4 bg-emerald-50 border-emerald-100">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <div>
           <h3 className="font-bold text-slate-900">Phone Verified</h3>
           <p className="text-sm text-slate-600">Your phone number {region} {phone} is active.</p>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto text-emerald-700 hover:bg-emerald-100 border-none" onClick={() => setStep('input')}>
            Change
        </Button>
      </div>
    )
  }

  return (
    <div className="card-surface p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <DevicePhoneMobileIcon className="w-6 h-6 text-slate-400" />
        <h3 className="font-bold text-lg text-slate-900">Phone Verification</h3>
      </div>
      
      {step === 'input' ? (
        <div className="flex gap-2">
           <select 
             value={region} 
             onChange={(e) => setRegion(e.target.value)}
             className="w-24 rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-primary-500 outline-none"
           >
             <option value="+1">🇺🇸 +1</option>
             <option value="+44">🇬🇧 +44</option>
             <option value="+90">🇹🇷 +90</option>
             <option value="+33">🇫🇷 +33</option>
           </select>
           <input 
             type="tel" 
             placeholder="555 123 4567" 
             value={phone}
             onChange={(e) => setPhone(e.target.value)}
             className="flex-1 rounded-xl border border-slate-200 px-4 py-2 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
           />
           <Button onClick={handleSendCode} disabled={!phone}>Send Code</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500">Enter code sent to {region} {phone}</span>
               <button onClick={() => setStep('input')} className="text-primary-600 font-bold hover:underline">Edit</button>
           </div>
           
           <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                />
              ))}
           </div>

           <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${timer > 0 ? 'text-slate-400' : 'text-primary-600 cursor-pointer'}`}>
                  {timer > 0 ? `Resend code in 00:${timer.toString().padStart(2, '0')}` : 'Resend Code'}
              </span>
              <span className="text-xs text-slate-300">Try '123456'</span>
           </div>
        </div>
      )}
    </div>
  )
}
