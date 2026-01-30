import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyBookings, updateBookingStatus, confirmAttendance } from '../api/bookings'
import { getOrCreateConversation } from '../api/messages'
import type { Booking } from '../api/bookings'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { getImageUrl } from '../utils/image'
import { 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

const tabs = [
  { id: 'all', label: 'All Bookings' },
  { id: 'pending', label: 'Requests' },
  { id: 'confirmed', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export default function GuideBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  
  const [activeTab, setActiveTab] = useState(initialStatus)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Update active tab if URL param changes
    const status = searchParams.get('status')
    if (status) {
      setActiveTab(status)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      setLoading(true)
      // Guide role hardcoded as we are in guide portal
      const data = await getMyBookings(user.id, 'STUDENT_GUIDE')
      // Normalize status to lowercase to match frontend types
      const normalizedData = data.map(b => ({
        ...b,
        status: b.status.toLowerCase() as any
      }))
      setBookings(normalizedData)
      setLoading(false)
    }
    fetchBookings()
  }, [user])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      if (newStatus === 'COMPLETED' || newStatus === 'CONFIRMED_ATTENDANCE') {
        const res = await confirmAttendance(bookingId, 'CONFIRMED')
        alert(res.message)
      } else if (newStatus === 'REPORT_NO_SHOW') {
        const res = await confirmAttendance(bookingId, 'NO_SHOW')
        alert(res.message)
      } else {
        await updateBookingStatus(bookingId, newStatus)
      }
      
      // Refresh local state (simplified: ideally re-fetch)
      const data = await getMyBookings(user!.id, 'STUDENT_GUIDE')
      const normalizedData = data.map(b => ({
        ...b,
        status: b.status.toLowerCase() as any
      }))
      setBookings(normalizedData)
    } catch (error) {
      console.error('Failed to update status', error)
      alert('Failed to update booking status')
    }
  }

  const handleContactTraveler = async (travelerId: string) => {
     if (!user) return
     try {
        const conversation = await getOrCreateConversation(user.id, travelerId)
        if (conversation && conversation.id) {
            navigate(`/guide/messages/${conversation.id}`)
        }
     } catch (error) {
        console.error("Failed to start conversation", error)
     }
  }

  const filteredBookings = bookings.filter(b => 
    activeTab === 'all' ? true : b.status === activeTab
  )

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold text-sm rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
            <p className="text-slate-500">You don't have any bookings in this category yet.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <GuideBookingCard 
               key={booking.id} 
               booking={booking} 
               onStatusUpdate={handleStatusUpdate}
               onContactTraveler={handleContactTraveler}
            />
          ))
        )}
      </div>
    </div>
  )
}

function GuideBookingCard({ booking, onStatusUpdate, onContactTraveler }: { 
    booking: Booking, 
    onStatusUpdate: (id: string, status: string) => void,
    onContactTraveler: (travelerId: string) => void
}) {
  const isPending = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isCompleted = booking.status === 'completed'
  const isCancelled = booking.status === 'cancelled'
  const isDisputed = booking.status === 'disputed' as any // Handle custom status if not in frontend types yet

  // Check if attendance is already reported (either CONFIRMED or NO_SHOW, assumed 'PENDING' if not set)
  // Backend returns strings 'PENDING', 'CONFIRMED', 'NO_SHOW'. Frontend type might be boolean | string.
  // We treat anything truthy and not 'PENDING' as reported.
  const hasReportedAttendance = booking.guideAttendance && booking.guideAttendance !== 'PENDING' && booking.guideAttendance !== false;

  return (
    <div className={`card-surface p-5 border transition-shadow ${isDisputed ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:shadow-md'}`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Traveler Info */}
        <div className="md:w-64 flex-shrink-0 flex items-start gap-4 md:border-r border-slate-100 pr-4">
           {booking.traveler && (
             <Avatar 
               src={getImageUrl(booking.traveler.image)} 
               alt={booking.traveler.name} 
               size="lg" 
               name={booking.traveler.name}
             />
           )}
           <div>
             <h3 className="font-bold text-slate-900">{booking.traveler?.name || 'Traveler'}</h3>
             <p className="text-sm text-slate-500">{booking.traveler?.email}</p>
             <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
               <UserIcon className="w-3.5 h-3.5" />
               {booking.notes ? 'Custom Request' : 'Standard Tour'}
             </div>
           </div>
        </div>

        {/* Tour Details */}
        <div className="flex-1 space-y-3">
           <div className="flex justify-between items-start">
             <div>
                <h4 className="font-bold text-lg text-slate-900 mb-1">
                   {booking.notes || `Tour with ${booking.traveler?.name}`}
                </h4>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-primary-500" />
                    {new Date(booking.date || booking.bookingDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-primary-500" />
                    {booking.time || booking.bookingTime} ({booking.duration === 'HALF_DAY' ? '4h' : '8h'})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    ${booking.price || booking.totalPrice}
                  </span>
                </div>
             </div>
             
             {/* Status Badge */}
             <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider
                ${isPending ? 'bg-amber-100 text-amber-700' : ''}
                ${isConfirmed ? 'bg-emerald-100 text-emerald-700' : ''}
                ${isCompleted ? 'bg-blue-100 text-blue-700' : ''}
                ${isCancelled ? 'bg-slate-100 text-slate-500' : ''}
                ${isDisputed ? 'bg-red-100 text-red-700' : ''}
             `}>
               {booking.status}
             </div>
           </div>

           {/* Actions */}
           {isPending && (
             <div className="flex gap-3 pt-2 justify-end">
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onStatusUpdate(booking.id, 'CANCELLED')}
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
               >
                 Decline Request
               </Button>
               <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onStatusUpdate(booking.id, 'CONFIRMED')}
                className="shadow-lg shadow-primary-500/20"
               >
                 Accept Request
               </Button>
             </div>
           )}

           {isConfirmed && (
             <div className="flex gap-3 pt-2 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500"
                  onClick={() => booking.traveler && onContactTraveler(booking.traveler.id)}
                >
                  Contact Traveler
                </Button>

                {!hasReportedAttendance ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusUpdate(booking.id, 'REPORT_NO_SHOW')}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                      Traveler No-Show
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onStatusUpdate(booking.id, 'CONFIRMED_ATTENDANCE')}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Mark Completed
                    </Button>
                  </>
                ) : (
                  <span className="text-sm font-bold text-slate-500 py-1.5 px-3 bg-slate-100 rounded-full flex items-center">
                    {booking.guideAttendance === 'CONFIRMED' ? (
                       <><CheckCircleIcon className="w-4 h-4 mr-1.5 text-emerald-500" /> You Confirmed</>
                    ) : ( 
                       <><ExclamationCircleIcon className="w-4 h-4 mr-1.5 text-rose-500" /> You Reported No-Show</>
                    )}
                  </span>
                )}
             </div>
           )}
           
           {isDisputed && (
             <div className="mt-2 text-right">
                <span className="text-red-600 text-sm font-bold">Booking Disputed - Contact Support</span>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
