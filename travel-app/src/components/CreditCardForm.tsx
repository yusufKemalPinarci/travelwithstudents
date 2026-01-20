import InputField from './InputField.tsx'

export default function CreditCardForm() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <InputField label="Card number" placeholder="0000 0000 0000 0000" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Expiration" placeholder="MM/YY" />
        <InputField label="CVC" placeholder="123" />
      </div>
      <InputField label="Cardholder name" placeholder="Full Name" />
    </div>
  )
}
