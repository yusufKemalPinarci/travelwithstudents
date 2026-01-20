type ToggleButtonProps = {
  options: readonly string[]
  selected: string
  onChange: (value: string) => void
}

export default function ToggleButton({ options, selected, onChange }: ToggleButtonProps) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1 text-sm font-medium">
      {options.map((option) => {
        const active = selected === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 rounded-full px-3 py-2 transition-all duration-200 ${
              active 
                ? 'bg-primary-600 shadow-soft text-white' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
