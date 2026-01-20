import { Link } from 'react-router-dom'
import type { Guide } from '../types.ts'
import RatingStars from './RatingStars.tsx'

type GuideCardProps = {
  guide: Guide
  compact?: boolean
}

export default function GuideCard({ guide, compact = false }: GuideCardProps) {
  return (
    <Link to={`/profile/${guide.id}`} className="card-surface block overflow-hidden hover:-translate-y-1 transition shadow-soft">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={guide.image}
          alt={guide.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-primary-700 shadow">
          {guide.city}
        </span>
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{guide.name}</p>
            <p className="text-sm text-slate-500">{guide.university}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            ${guide.price}/hr
          </span>
        </div>
        <RatingStars rating={guide.rating} count={guide.reviews} />
        <p className="text-sm text-slate-600 line-clamp-2">{guide.bio}</p>
        {!compact && guide.tags?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {guide.tags.map((tag) => (
              <span key={tag} className="pill bg-slate-100 text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
