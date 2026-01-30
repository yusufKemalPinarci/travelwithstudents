import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { getGuideStats } from '../api/stats'
import type { GuideStats } from '../api/stats'
import { useAuth } from '../context/AuthContext'

export default function EarningsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<GuideStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      const data = await getGuideStats(user.id)
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12 text-slate-600">İstatistikler yüklenemedi</div>
  }
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <header className="space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm font-medium">
             <Link to="/dashboard" className="text-slate-500 hover:text-blue-900 transition-colors">
                Dashboard
             </Link>
             <ChevronRightIcon className="h-5 w-5 text-slate-400 mx-2" aria-hidden="true" />
             <span className="text-blue-800 font-semibold">Earnings & Payouts</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-[#1A237E] leading-tight">Earnings & Payouts</h1>
                <p className="text-lg font-normal text-slate-600 mt-2">
                    Manage your income, track payouts, and download financial reports.
                </p>
            </div>
            <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm">
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
            </select>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
          <div className="card-surface p-6 col-span-2">
              <h3 className="font-semibold text-slate-700 mb-6">Earnings History</h3>
              {/* CSS Only Bar Chart Mock */}
              <div className="flex items-end justify-between h-48 gap-4 px-2">
                  {stats.earningsHistory.map((item) => {
                      const maxAmount = Math.max(...stats.earningsHistory.map(i => i.amount))
                      const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                      return (
                          <div key={item.month} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="relative w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden group-hover:bg-slate-200 transition-colors">
                                    <div 
                                        style={{ height: `${height}%` }} 
                                        className="w-full bg-primary-600 rounded-t-lg transition-all duration-500 hover:bg-primary-500 relative group/bar"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${item.amount}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{item.month}</span>
                          </div>
                      )
                  })}
              </div>
          </div>
          
          <div className="space-y-4">
               {/* Wallet Direction Card */}
               <div className="card-surface p-6 space-y-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <p className="text-sm font-medium text-white/70">Total Earnings</p>
                    <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-white/50 mb-4">Manage your bank accounts and withdrawals in your wallet.</p>
                    <Link to="/guide/wallet" className="block w-full bg-white text-slate-900 font-bold py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-center">
                        Go to Wallet
                    </Link>
               </div>
          </div>
      </div>
      
       <div className="card-surface overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-900">
               Recent Transactions
           </div>
           <div className="divide-y divide-slate-100">
               {(!stats.recentTransactions || stats.recentTransactions.length === 0) ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No recent transactions.</div>
               ) : (
                 stats.recentTransactions.map((trx) => (
                   <div key={trx.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                       <div>
                           <p className="font-medium text-slate-900">{trx.tourName}</p>
                           <p className="text-xs text-slate-500">
                             {new Date(trx.date).toLocaleDateString()} • ID: #{trx.id.substring(0,6).toUpperCase()}
                           </p>
                       </div>
                       <span className="font-bold text-emerald-600">+${trx.amount}</span>
                   </div>
                 ))
               )}
           </div>
       </div>
    </div>
  )
}
