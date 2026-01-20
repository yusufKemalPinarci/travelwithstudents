type PriceBreakdownProps = {
  subtotal: number
}

export default function PriceBreakdown({ subtotal }: PriceBreakdownProps) {
  const serviceFee = Math.round(subtotal * 0.1)
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + serviceFee + tax

  return (
    <div className="space-y-3 py-4 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Guide fee</span>
        <span>${subtotal}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Service fee</span>
        <span>${serviceFee}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Tax</span>
        <span>${tax}</span>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
        <span>Total</span>
        <span>${total}</span>
      </div>
    </div>
  )
}
