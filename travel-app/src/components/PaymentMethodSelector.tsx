type Method = 'card' | 'apple' | 'google'

type PaymentMethodSelectorProps = {
  method: Method
  onChange: (method: Method) => void
}

export default function PaymentMethodSelector({ method, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('card')}
        className={`flex-1 rounded-xl border p-4 text-center transition-all ${
          method === 'card'
            ? 'border-primary-600 bg-primary-50 text-primary-800 ring-1 ring-primary-600'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="font-semibold block">Card</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('apple')}
        className={`flex-1 rounded-xl border p-4 text-center transition-all ${
          method === 'apple'
            ? 'border-black bg-black text-white'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="font-semibold block">Apple Pay</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('google')}
         className={`flex-1 rounded-xl border p-4 text-center transition-all ${
          method === 'google'
            ? 'border-slate-400 bg-slate-100 text-slate-800'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="font-semibold block">Google Pay</span>
      </button>
    </div>
  )
}
