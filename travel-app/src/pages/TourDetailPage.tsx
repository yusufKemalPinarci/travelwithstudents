import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon, GlobeAltIcon, CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getTourById, type Tour } from '../api/tours'
import { getImageUrl } from '../utils/image'
import Button from '../components/Button'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(0)

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const data = await getTourById(id)
        setTour(data)
      } catch (error) {
        console.error('Failed to fetch tour:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Tour not found</p>
        <Button as={Link} to="/tours" variant="ghost" className="mt-4">
          Browse all tours
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>

      {/* Photo Gallery */}
      <div className="card-surface rounded-2xl overflow-hidden">
        {tour.photos && Array.isArray(tour.photos) && tour.photos.length > 0 && tour.photos[0] ? (
          <div>
            <div className="aspect-[21/9] bg-slate-200 dark:bg-slate-800">
              {tour.photos[selectedPhoto] ? (
                <img
                  src={getImageUrl(tour.photos[selectedPhoto])}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span>No image available</span>
                </div>
              )}
            </div>
            {tour.photos.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {tour.photos.filter(p => p).map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhoto === idx
                        ? 'border-orange-600 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(photo)}
                      alt={`${tour.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[21/9] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            No images available
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Category */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="pill bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {tour.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {tour.title}
                </h1>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPinIcon className="w-5 h-5" />
                <span>{tour.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ClockIcon className="w-5 h-5" />
                <span>{tour.duration} hours</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <GlobeAltIcon className="w-5 h-5" />
                <span>{tour.language}</span>
              </div>
              {tour.tourDate && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{new Date(tour.tourDate).toLocaleDateString()}</span>
                  {tour.tourTime && <span>at {tour.tourTime}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                <span>👥</span>
                <span>{tour.availableSlots} / {tour.maxParticipants} spots left</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card-surface p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">About this experience</h2>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {tour.description}
            </p>
          </div>

          {/* Guide Info */}
          <div className="card-surface p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your guide</h2>
            <Link
              to={`/profile/${tour.guide.id}`}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {tour.guide.user.profileImage ? (
                <img
                  src={getImageUrl(tour.guide.user.profileImage)}
                  alt={tour.guide.user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <UserCircleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{tour.guide.user.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Student Guide</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="card-surface p-6 space-y-4 sticky top-20">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">${tour.price}</span>
                <span className="text-slate-600 dark:text-slate-400"> / person</span>
              </div>
            </div>

            {tour.availableSlots === 0 ? (
              <div className="space-y-3">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-semibold">
                  Fully Booked
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  as={Link}
                  to={`/book-tour/${tour.id}`}
                  className="w-full"
                size="lg"
              >
                <CalendarIcon className="w-5 h-5" />
                Book Now
              </Button>
              
              <Button
                as={Link}
                to={`/profile/${tour.guide.id}`}
                variant="outline"
                className="w-full"
              >
                View Guide Profile
              </Button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Base price</span>
                <span className="font-medium text-slate-900 dark:text-white">${tour.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Platform fee (10%)</span>
                <span className="font-medium text-slate-900 dark:text-white">${(tour.price * 0.1).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-slate-900 dark:text-white">${(tour.price * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
