type TimeSlotGridProps = {
  slots: string[]
  selectedSlot: string | null
  onSlotSelect: (slot: string) => void
}

export default function TimeSlotGrid({ slots, selectedSlot, onSlotSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSlotSelect(slot)}
          className={`
            rounded-xl border px-4 py-3 text-sm font-semibold transition-all
            ${
              selectedSlot === slot
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-600'
                : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-slate-50'
            }
          `}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}
