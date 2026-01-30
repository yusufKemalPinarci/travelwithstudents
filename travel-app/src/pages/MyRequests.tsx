import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getMyBookingRequests, 
  cancelBookingRequest, 
  completeRequestPayment,
  getTimeRemaining,
  getStatusColor,
  getStatusText,
  type BookingRequest 
} from '../api/bookingRequests'
import { useAuth } from '../context/AuthContext'

export default function MyRequests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'expired'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchRequests()
    }
  }, [user?.id])

  const fetchRequests = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getMyBookingRequests(user.id, 'TRAVELER')
      setRequests(data)
    } catch (error: any) {
      console.error('Error fetching requests:', error)
      setError(error.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    
    try {
      await cancelBookingRequest(requestId)
      await fetchRequests() // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel request')
    }
  }

  const handlePayNow = async (requestId: string) => {
    // Navigate to payment page or handle payment
    navigate(`/payment/${requestId}`)
  }

  const getDefaultAvatar = (name: string) => {
    const firstLetter = name?.charAt(0)?.toUpperCase() || '?'
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
        {firstLetter}
      </div>
    )
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => {
        if (filter === 'pending') return req.status === 'PENDING'
        if (filter === 'accepted') return req.status === 'ACCEPTED' || req.status === 'PAYMENT_PENDING'
        if (filter === 'rejected') return req.status === 'REJECTED'
        if (filter === 'expired') return req.status === 'EXPIRED' || req.status === 'PAYMENT_EXPIRED'
        return true
      })

  const getCountForFilter = (filterType: typeof filter) => {
    if (filterType === 'all') return requests.length
    if (filterType === 'pending') return requests.filter(r => r.status === 'PENDING').length
    if (filterType === 'accepted') return requests.filter(r => r.status === 'ACCEPTED' || r.status === 'PAYMENT_PENDING').length
    if (filterType === 'rejected') return requests.filter(r => r.status === 'REJECTED').length
    if (filterType === 'expired') return requests.filter(r => r.status === 'EXPIRED' || r.status === 'PAYMENT_EXPIRED').length
    return 0
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Booking Requests
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your booking requests and their status
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto">
          {(['all', 'pending', 'accepted', 'rejected', 'expired'] as const).map((tab) => {
            const count = getCountForFilter(tab)
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filter === tab
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {filter === 'all' ? 'No booking requests yet' : `No ${filter} requests`}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {filter === 'all' ? 'Start exploring and send booking requests to student guides' : `You don't have any ${filter} requests`}
            </p>
            <button
              onClick={() => filter === 'all' ? navigate('/search') : setFilter('all')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg"
            >
              {filter === 'all' ? 'Find Student Guides' : 'View All Requests'}
            </button>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  {/* Guide Avatar */}
                  <div className="flex-shrink-0">
                    {request.guide.user.profileImage ? (
                      <img
                        src={`http://localhost:5000${request.guide.user.profileImage}`}
                        alt={request.guide.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement?.appendChild(getDefaultAvatar(request.guide.user.name).props.children[0])
                        }}
                      />
                    ) : (
                      getDefaultAvatar(request.guide.user.name)
                    )}
                  </div>

                  {/* Request Details */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                          {request.guide.user.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(request.bookingDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.bookingTime} ({request.duration})
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    {/* Notes */}
                    {request.message && (
                      <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                          "{request.message}"
                        </p>
                      </div>
                    )}

                    {/* Price and Time Remaining */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        Estimated: ${request.estimatedPrice?.toFixed(2) || 'TBD'}
                      </div>
                      
                      {(request.status === 'PENDING' || request.status === 'ACCEPTED' || request.status === 'PAYMENT_PENDING') && (
                        <div className="text-sm">
                          {request.status === 'PENDING' && request.expiresAt && (
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                              Expires in {getTimeRemaining(request.expiresAt)}
                            </span>
                          )}
                          {(request.status === 'ACCEPTED' || request.status === 'PAYMENT_PENDING') && request.paymentDeadline && (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              Pay within {getTimeRemaining(request.paymentDeadline)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="px-4 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                        >
                          Cancel Request
                        </button>
                      )}
                      
                      {(request.status === 'ACCEPTED' || request.status === 'PAYMENT_PENDING') && (
                        <>
                          <button
                            onClick={() => handlePayNow(request.id)}
                            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-600 transition-all text-sm shadow-lg"
                          >
                            Pay Now
                          </button>
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="px-4 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {request.status === 'REJECTED' && (
                        <button
                          onClick={() => navigate(`/guide/${request.guide.id}`)}
                          className="px-4 py-2 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-sm"
                        >
                          Try Again
                        </button>
                      )}

                      {(request.status === 'EXPIRED' || request.status === 'PAYMENT_EXPIRED') && (
                        <button
                          onClick={() => navigate(`/guide/${request.guide.id}`)}
                          className="px-4 py-2 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-sm"
                        >
                          Send New Request
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/guide/${request.guide.id}`)}
                        className="px-4 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                      >
                        View Guide
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  )
}
