import { useNavigate, Link } from 'react-router-dom'
import { 
  ClockIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon, 
  EyeIcon, 
  StarIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { guideStats } from '../utils/mockData.ts'
import Button from '../components/Button.tsx'
import EarningsChart from '../components/EarningsChart.tsx'
import LevelProgressBar from '../components/LevelProgressBar.tsx'

export default function GuideDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <section>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
              <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Alex 👋</h1>
                  <p className="text-slate-500 font-medium">You have <span className="text-primary-600 font-bold">3 pending requests</span> needing your attention.</p>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     Online
                 </div>
                 <Button as={Link} to='/guide/list-experience' variant="primary" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    New Tour
                 </Button>
              </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <StatsCard 
                  label="Total Earnings" 
                  value={`$${guideStats.totalEarnings}`} 
                  trend="+12%" 
                  trendUp={true} 
                  Icon={CurrencyDollarIcon}
               />
               <StatsCard 
                  label="Profile Views" 
                  value={guideStats.profileViews.toString()} 
                  trend="+8 today" 
                  trendUp={true} 
                  Icon={EyeIcon}
               />
               <StatsCard 
                  label="Avg. Rating" 
                  value={guideStats.rating.toString()} 
                  subtext="Based on 24 reviews" 
                  Icon={StarIcon}
               />
               <StatsCard 
                  label="Completion Rate" 
                  value="98%" 
                  trend="-1%" 
                  trendUp={false} 
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
                <EarningsChart />
              </div>

              {/* Request Queue */}
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                      <h3 className="section-heading mb-0">Request Queue</h3>
                      <Button variant="ghost" size="sm" className="text-primary-600">View All</Button>
                  </div>
                  
                  {/* Mock Requests */}
                  <RequestItem 
                    name="Sarah & Tom" 
                    tour="Gothic Quarter Night Walk" 
                    date="Feb 24, 7:00 PM" 
                    guests={2} 
                    amount={84}
                    timeLeft="2h left"
                  />
                  <RequestItem 
                    name="Business Group" 
                    tour="Tech Startups of Barcelona" 
                    date="Mar 02, 10:00 AM" 
                    guests={5} 
                    amount={250}
                    timeLeft="5h left"
                  />
              </div>

              {/* Upcoming Bookings */} 
               <div>
                  <h3 className="section-heading mb-4 px-1">Upcoming Confirmed</h3>
                  <div className="space-y-3">
                     <div className="card-surface p-4 flex gap-4 items-center border border-emerald-100 bg-emerald-50/30">
                          <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-emerald-100 flex-shrink-0 flex flex-col items-center justify-center text-emerald-800">
                              <span className="font-bold text-lg leading-none">20</span>
                              <span className="text-[10px] uppercase font-bold">Feb</span>
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-slate-900">Historical Walk: Gothic Quarter</h4>
                              <p className="text-sm text-slate-600 mt-0.5">10:00 AM • 3 Guests • <span className="font-medium text-emerald-700">Paid $112.00</span></p>
                          </div>
                          <Button variant="outline" size="sm">Details</Button>
                      </div>
                  </div>
               </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
              <LevelProgressBar level={2} currentExp={350} maxExp={500} />

               <div className="card-surface p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Latest Reviews</h3>
                  <div className="space-y-4">
                      <ReviewItem 
                        name="Jessica M." 
                        rating={5} 
                        text="Alex was such a fun guide! We saw so many cool spots." 
                      />
                       <ReviewItem 
                        name="Tom H." 
                        rating={4} 
                        text="Great history knowledge, but we ran a bit late." 
                      />
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

function RequestItem({ name, tour, date, guests, amount, timeLeft }: any) {
  return (
    <div className="card-surface p-4 flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:bg-amber-500 transition-colors"></div>
        <div className="w-12 h-12 bg-amber-100 rounded-full flex-shrink-0 flex items-center justify-center text-amber-700">
            <ClockIcon className="w-6 h-6" />
        </div>
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
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-rose-600 h-9 px-3">Decline</Button>
          <Button size="sm" className="h-9 px-4 shadow-md shadow-primary-500/20">Accept</Button>
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
