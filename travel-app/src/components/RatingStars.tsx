type RatingStarsProps = {
  rating: number
  count?: number
}

export default function RatingStars({ rating, count }: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <div className="flex items-center gap-2 text-sm text-amber-500">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-4 w-4 ${rounded >= star ? 'fill-amber-400' : 'fill-none stroke-amber-400'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M11.48 3.499a.562.562 0 011.04 0l2.116 5.056a.563.563 0 00.475.345l5.343.463c.499.043.701.663.321.988l-4.073 3.497a.563.563 0 00-.182.557l1.24 5.276a.562.562 0 01-.84.61l-4.584-2.744a.563.563 0 00-.586 0L7.186 20.791a.562.562 0 01-.84-.61l1.24-5.276a.563.563 0 00-.182-.557L3.331 10.35a.563.563 0 01.321-.988l5.343-.463a.563.563 0 00.475-.345l2.11-5.056z"
            />
          </svg>
        ))}
      </div>
      <span className="text-slate-700 font-semibold">{rating.toFixed(1)}</span>
      {count ? <span className="text-slate-500">({count})</span> : null}
    </div>
  )
}
