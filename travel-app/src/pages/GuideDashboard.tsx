import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon, 
  EyeIcon, 
  StarIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  UserCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { getGuideStats } from '../api/stats'
import { updateBookingStatus } from '../api/bookings'
import type { GuideStats } from '../api/stats'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button.tsx'
import EarningsChart from '../components/EarningsChart.tsx'
import LevelProgressBar from '../components/LevelProgressBar.tsx'
import Avatar from '../components/Avatar'
import { getImageUrl } from '../utils/image'

export default function GuideDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<GuideStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
      if (!user) return
      const data = await getGuideStats(user.id)
      setStats(data)
      setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [user])

  const handleBookingAction = async (bookingId: string, status: string) => {
      try {
          await updateBookingStatus(bookingId, status)
          await loadStats() // Refresh list
      } catch (error) {
          console.error("Failed to update status", error)
          alert("Failed to update booking status")
      }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12 text-slate-600">Failed to load statistics</div>
  }

  const pendingRequests = stats.upcomingBookings.filter(b => b.status === 'PENDING')
  const confirmedBookings = stats.upcomingBookings.filter(b => b.status === 'CONFIRMED')

  return (
    <div className="space-y-6">
      {/* Mode Switch Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full p-2">
              <UserCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Want to browse as a traveler?</h3>
              <p className="text-xs text-slate-600">Switch to traveler mode to book tours from other guides</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-lg transition-colors shadow-sm border border-blue-200"
          >
            <span>Browse Tours</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Welcome & Stats */}
      <section>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
              <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name || 'Guide'} 👋</h1>
                  <p className="text-slate-500 font-medium">You have <span className="text-primary-600 font-bold">{stats.pendingCount} pending requests</span> needing your attention.</p>
              </div>
              <div className="flex gap-3">
                 <div className={`flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${stats.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                     <span className={`w-2.5 h-2.5 rounded-full ${stats.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                     {stats.isAvailable ? 'Online' : 'Offline'}
                 </div>
              </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <StatsCard 
                  label="Total Earnings" 
                  value={`$${stats.totalEarnings}`} 
                  // trend="+12%" 
                  // trendUp={true} 
                  Icon={CurrencyDollarIcon}
               />
               <StatsCard 
                  label="Profile Views" 
                  value={stats.profileViews.toString()} 
                  // trend="+8 today" 
                  // trendUp={true} 
                  Icon={EyeIcon}
               />
               <StatsCard 
                  label="Avg. Rating" 
                  value={typeof stats.rating === 'number' ? stats.rating.toFixed(1) : '0.0'} 
                  subtext={`Based on ${stats.totalReviews} reviews`} 
                  Icon={StarIcon}
               />
               <StatsCard 
                  label="Completion Rate" 
                  value={stats.completionRate} 
                  // trend="-1%" 
                  // trendUp={false} 
                  Icon={CheckCircleIcon}
               />
          </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Earnings Chart */}
              <div className="h-80">
                <EarningsChart data={stats.earningsHistory} />
              </div>

              {/* Request Queue */}
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                      <h3 className="section-heading mb-0">Request Queue</h3>
                      <Button variant="ghost" size="sm" className="text-primary-600" as={Link} to="/guide/bookings?status=pending">View All</Button>
                  </div>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500">No pending requests</p>
                    </div>
                  ) : (
                    pendingRequests.map(booking => (
                      <RequestItem 
                        key={booking.id}
                        name={booking.travelerName}
                        image={booking.travelerImage}
                        tour={booking.tourName}
                        date={`${new Date(booking.date).toLocaleDateString()} ${booking.time}`}
                        guests={booking.guests || 1}
                        amount={booking.price}
                        timeLeft="Action Required"
                        onAccept={() => handleBookingAction(booking.id, 'CONFIRMED')}
                        onDecline={() => handleBookingAction(booking.id, 'CANCELLED')}
                      />
                    ))
                  )}
              </div>

              {/* Upcoming Bookings */} 
               <div>
                  <h3 className="section-heading mb-4 px-1">Upcoming Confirmed</h3>
                  <div className="space-y-3">
                     {confirmedBookings.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <p className="text-slate-500">No upcoming tours</p>
                        </div>
                     ) : (
                        confirmedBookings.map(booking => (
                           <div key={booking.id} className="card-surface p-4 flex gap-4 items-center border border-emerald-100 bg-emerald-50/30">
                              <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-emerald-100 flex-shrink-0 flex flex-col items-center justify-center text-emerald-800">
                                  <span className="font-bold text-lg leading-none">{new Date(booking.date).getDate()}</span>
                                  <span className="text-[10px] uppercase font-bold">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-900">{booking.tourName}</h4>
                                  <p className="text-sm text-slate-600 mt-0.5">
                                    {booking.time} • with {booking.travelerName} • <span className="font-medium text-emerald-700">Earnings ${booking.price}</span>
                                  </p>
                              </div>
                              <Button variant="outline" size="sm">Details</Button>
                          </div>
                        ))
                     )}
                  </div>
               </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
              <LevelProgressBar 
                level={stats.level} 
                currentExp={stats.currentXp} 
                maxExp={stats.nextLevelXp} 
                title={stats.levelTitle}
              />

               <div className="card-surface p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Latest Reviews</h3>
                  <div className="space-y-4">
                      {stats.recentReviews.length === 0 ? (
                         <p className="text-slate-500 text-sm">No reviews yet.</p>
                      ) : (
                        stats.recentReviews.map(review => (
                          <ReviewItem 
                            key={review.id}
                            name={review.travelerName}
                            rating={review.rating} 
                            text={review.comment} 
                          />
                        ))
                      )}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-primary-600" onClick={() => navigate('/guide/reviews')}>View all reviews</Button>
              </div>
          </div>
      </div>
    </div>
  )
}

function StatsCard({ label, value, trend, trendUp, subtext, Icon }: any) {
  return (
    <div className="card-surface p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
       <div className="flex justify-between items-start mb-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
          {Icon && <Icon className="w-5 h-5 text-slate-400" />}
       </div>
       <div>
           <p className="text-2xl font-black text-slate-900">{value}</p>
           {trend && (
             <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
               {trendUp ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
               {trend}
             </div>
           )}
           {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
       </div>
    </div>
  )
}

function RequestItem({ name, tour, date, guests, amount, timeLeft, image, gender, onAccept, onDecline }: any) {
  return (
    <div className="card-surface p-4 flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:bg-amber-500 transition-colors"></div>
        <Avatar 
          src={image ? getImageUrl(image) : undefined} 
          alt={name} 
          size="md" 
          gender={gender}
          name={name}
        />
        <div className="flex-1">
             <div className="flex flex-wrap justify-between items-start gap-2">
                <h4 className="font-bold text-slate-900">{tour}</h4>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                   <ClockIcon className="w-3 h-3" /> {timeLeft}
                </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
               <span className="font-semibold text-slate-900">{name}</span> • {date} • {guests} Guests
            </p>
            <p className="text-xs font-bold text-primary-600 mt-0.5">Potential Earnings: ${amount}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={onDecline} variant="ghost" size="sm" className="text-slate-500 hover:text-rose-600 h-9 px-3">Decline</Button>
          <Button onClick={onAccept} size="sm" className="h-9 px-4 shadow-md shadow-primary-500/20">Accept</Button>
        </div>
    </div>
  )
}

function ReviewItem({ name, rating, text }: any) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
        <div className="flex justify-between mb-1">
            <span className="font-bold text-xs text-slate-900">{name}</span>
            <div className="flex text-amber-400 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                i < rating ? (
                    <StarIconSolid key={i} className="w-3.5 h-3.5" />
                ) : (
                    <StarIcon key={i} className="w-3.5 h-3.5 text-slate-300" />
                )
              ))}
            </div>
        </div>
        <p className="text-xs text-slate-500 italic leading-relaxed">"{text}"</p>
    </div>
  )
}
