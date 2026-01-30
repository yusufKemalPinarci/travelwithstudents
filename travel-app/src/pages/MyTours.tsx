import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getGuideTours, deleteTour } from '../api/tours'
import { getUserProfile } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { PencilIcon, TrashIcon, PlusIcon, CalendarIcon, UsersIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface Tour {
  id: string
  title: string
  description: string
  category: string
  location: string
  duration: number
  price: number
  language: string
  photos: string[]
  tourDate?: string
  tourTime?: string
  maxParticipants: number
  availableSlots: number
  isActive: boolean
  bookings?: Array<{
    id: string
    status: string
    participantCount: number
  }>
}

export default function MyTours() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null)
  const [guideProfileId, setGuideProfileId] = useState<string | null>(null)

  useEffect(() => {
    fetchTours()
  }, [user])

  const fetchTours = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Get guide profile ID from user profile
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile?.guideProfile?.id) {
        setGuideProfileId(userProfile.guideProfile.id)
        const toursData = await getGuideTours(userProfile.guideProfile.id)
        setTours(toursData)
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (tour: Tour) => {
    setTourToDelete(tour)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tourToDelete) return

    try {
      const result = await deleteTour(tourToDelete.id)
      
      if (result.success) {
        setTours(tours.filter(t => t.id !== tourToDelete.id))
        setDeleteModalOpen(false)
        setTourToDelete(null)
      } else {
        alert(result.message || 'Failed to delete tour')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete tour'
      alert(errorMessage)
    }
  }

  const getImageUrl = (photo: string) => {
    if (!photo) return '/placeholder-tour.jpg'
    return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`
  }

  const hasActiveBookings = (tour: Tour) => {
    return tour.bookings && tour.bookings.length > 0
  }

  const getActiveBookingsCount = (tour: Tour) => {
    if (!tour.bookings) return 0
    return tour.bookings.reduce((sum, b) => sum + b.participantCount, 0)
  }

  const isTourExpired = (tour: Tour) => {
    if (!tour.tourDate) return false
    const tourDate = new Date(tour.tourDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tourDate < today
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your tours...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tours</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your tour offerings</p>
        </div>
      </div>

      {tours.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
          <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No tours yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create your first tour to start accepting bookings</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tours.map((tour) => {
            const activeBookings = hasActiveBookings(tour)
            const bookingsCount = getActiveBookingsCount(tour)
            
            return (
              <div key={tour.id} className="card-surface p-0 flex flex-col sm:flex-row overflow-hidden">
                <div className="w-full sm:w-64 h-48 sm:h-auto relative">
                  <img
                    src={getImageUrl(tour.photos?.[0])}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-tour.jpg'
                    }}
                  />
                  {activeBookings && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {bookingsCount} booked
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{tour.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <MapPinIcon className="w-4 h-4" />
                          {tour.location}
                          <span className="text-slate-300">•</span>
                          <span className="pill bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                            {tour.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">${tour.price}</span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {tour.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {tour.tourDate ? new Date(tour.tourDate).toLocaleDateString() : 'No date set'}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {tour.tourTime || 'No time set'} • {tour.duration}h
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        {tour.availableSlots}/{tour.maxParticipants} slots
                      </div>
                    </div>

                    {isTourExpired(tour) && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-800 dark:text-red-300">
                          <p className="font-semibold">Tour date has passed</p>
                          <p>This tour cannot be edited or updated anymore. Please create a new tour for future dates.</p>
                        </div>
                      </div>
                    )}

                    {activeBookings && !isTourExpired(tour) && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 dark:text-amber-300">
                          <p className="font-semibold">Active bookings exist</p>
                          <p>Some fields cannot be modified. Tour cannot be deleted until bookings are completed.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-tour/${tour.id}`)}
                      className="flex items-center gap-2"
                      disabled={isTourExpired(tour)}
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(tour)}
                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      disabled={activeBookings || isTourExpired(tour)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && tourToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Tour</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete "<span className="font-semibold">{tourToDelete.title}</span>"?
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setTourToDelete(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Tour
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
