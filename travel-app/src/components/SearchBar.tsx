type SearchBarProps = {
  placeholder?: string
  onSearch: (query: string) => void
}

export default function SearchBar({ placeholder = 'Search for guides or cities', onSearch }: SearchBarProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-soft">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105 5a7.5 7.5 0 0011.65 11.65z" />
      </svg>
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="button"
        className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Search
      </button>
    </div>
  )
}
