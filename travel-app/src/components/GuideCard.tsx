import { Link } from 'react-router-dom'
import type { Guide } from '../types.ts'
import RatingStars from './RatingStars.tsx'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext.tsx'
import { getImageUrl, getDefaultAvatar } from '../utils/image'

type GuideCardProps = {
  guide: Guide
  compact?: boolean
}

export default function GuideCard({ guide, compact = false }: GuideCardProps) {
  const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth()

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(guide.id)
  }

  const saved = isInWishlist(guide.id)
  const displayImage = guide.image ? getImageUrl(guide.image) : getDefaultAvatar(guide.name);

  return (
    <Link to={`/profile/${guide.id}`} className="card-surface block overflow-hidden hover:-translate-y-1 transition shadow-soft">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <img
          src={displayImage}
          alt={guide.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getDefaultAvatar(guide.name);
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-primary-700 shadow">
          {guide.city}
        </span>
        {isAuthenticated && (
          <button
            onClick={handleWishlistClick}
            className="absolute right-3 top-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {saved ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        )}
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-slate-900 dark:text-white">{guide.name}</p>
              {guide.isStudentVerified && (
                <CheckBadgeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" title="Verified student" />
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{guide.university}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary-50 dark:bg-primary-900/30 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
            ${guide.price}/hr
          </span>
        </div>
        <div className="flex items-center gap-2">
          {guide.reviews > 0 ? (
            <RatingStars rating={guide.rating} count={guide.reviews} />
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">No reviews yet</p>
          )}
          {guide.totalBookings !== undefined && guide.totalBookings > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">• {guide.totalBookings} {guide.totalBookings === 1 ? 'tour' : 'tours'}</span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{guide.bio}</p>
        {!compact && guide.tags?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {guide.tags.map((tag) => (
              <span key={tag} className="pill bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
