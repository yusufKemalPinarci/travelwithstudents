type CalendarWidgetProps = {
  selectedDate: string | null
  onDateSelect: (date: string) => void
}

export default function CalendarWidget({ selectedDate, onDateSelect }: CalendarWidgetProps) {
  // Mocking Feb 2026
  const daysInMonth = 28
  const startDay = 0 // Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="card-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">February 2026</h3>
        <div className="flex gap-2">
            <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500">&lt;</button>
            <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500">&gt;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-slate-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
            const dateStr = `2026-02-${day.toString().padStart(2, '0')}`
            const isSelected = selectedDate === dateStr
            const isPast = day < 1 // Mock past check

            return (
                <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => onDateSelect(dateStr)}
                    className={`
                        h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-colors
                        ${isSelected ? 'bg-primary-600 text-white' : 'hover:bg-primary-50 text-slate-700'}
                        ${isPast ? 'text-slate-300 cursor-not-allowed hover:bg-transparent' : ''}
                    `}
                >
                    {day}
                </button>
            )
        })}
      </div>
    </div>
  )
}
