import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { getAllTours, type Tour } from '../api/tours'
import { getImageUrl } from '../utils/image'
import { TOUR_CATEGORIES, LANGUAGES } from '../utils/constants'

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'All',
    location: '',
    minPrice: '',
    maxPrice: '',
    language: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTours()
  }, [filters])

  const fetchTours = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.category !== 'All') params.category = filters.category
      if (filters.location) params.location = filters.location
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.language) params.language = filters.language

      const data = await getAllTours(params)
      setTours(data)
    } catch (error) {
      console.error('Failed to fetch tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      category: 'All',
      location: '',
      minPrice: '',
      maxPrice: '',
      language: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Tours</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover unique experiences led by verified student guides
        </p>
      </div>

      {/* Filters */}
      <div className="card-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filters
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium lg:hidden"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
            >
              <option value="All">All Categories</option>
              {TOUR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="City or area"
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Min Price ($)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Max Price ($)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="1000"
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filters.category !== 'All' || filters.location || filters.minPrice || filters.maxPrice || filters.language) && (
          <button
            onClick={resetFilters}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {loading ? 'Loading...' : `${tours.length} tour${tours.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20 card-surface rounded-2xl">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No tours found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="card-surface rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Tour Image */}
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  {tour.photos && tour.photos.length > 0 ? (
                    <img
                      src={getImageUrl(tour.photos[0])}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-sm font-bold text-slate-900 dark:text-white shadow-sm">
                    ${tour.price}
                  </div>
                </div>

                {/* Tour Info */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="pill-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        {tour.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {tour.duration}h
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {tour.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tour.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPinIcon className="w-4 h-4" />
                      {tour.location}
                    </div>
                    {tour.availableSlots !== undefined && (
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        tour.availableSlots === 0 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : tour.availableSlots <= 5
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {tour.availableSlots === 0 ? 'Sold Out' : `${tour.availableSlots} left`}
                      </div>
                    )}
                  </div>

                  {/* Guide Info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {tour.guide.user.profileImage ? (
                      <img
                        src={getImageUrl(tour.guide.user.profileImage)}
                        alt={tour.guide.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      by <span className="font-medium text-slate-900 dark:text-white">{tour.guide.user.name}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
