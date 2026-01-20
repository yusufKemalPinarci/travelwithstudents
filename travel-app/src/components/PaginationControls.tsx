type PaginationControlsProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-soft text-sm">
      <button
        className={`px-3 py-1 rounded-lg ${prevDisabled ? 'text-slate-400' : 'text-primary-700 hover:bg-primary-50'}`}
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
      >
        Previous
      </button>
      <p className="text-slate-600">
        Page {page} of {totalPages}
      </p>
      <button
        className={`px-3 py-1 rounded-lg ${nextDisabled ? 'text-slate-400' : 'text-primary-700 hover:bg-primary-50'}`}
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
      >
        Next
      </button>
    </div>
  )
}
