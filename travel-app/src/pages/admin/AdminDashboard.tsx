import { useState, useEffect } from 'react'
import { 
    UsersIcon, 
    CalendarDaysIcon, 
    BanknotesIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { getAdminStats } from '../../api/stats'
import type { AdminStats } from '../../api/stats'

// ...existing code...

// ...existing code...

const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getAdminStats()
            setStats(data)
            setLoading(false)
        }
        fetchStats()
    }, [])

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

    const statsCards = [
        { 
            name: 'Total Users', 
            value: stats.totalUsers.toLocaleString(), 
            change: '+12.5%', 
            trend: 'up',
            icon: UsersIcon,
            color: 'bg-blue-500'
        },
        { 
            name: 'Active Bookings', 
            value: stats.pendingBookings.toString(), 
            change: '+8.2%', 
            trend: 'up',
            icon: CalendarDaysIcon,
            color: 'bg-green-500'
        },
        { 
            name: 'Total Revenue', 
            value: `$${stats.totalRevenue.toFixed(0)}`, 
            change: '+15%', 
            trend: 'up',
            icon: BanknotesIcon,
            color: 'bg-orange-500'
        },
        { 
            name: 'Completed', 
            value: stats.completedBookings.toString(), 
            change: '+10', 
            trend: 'up',
            icon: StarIcon,
            color: 'bg-amber-500'
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-bold ${
                                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat.trend === 'up' ? (
                                    <ArrowTrendingUpIcon className="w-4 h-4" />
                                ) : (
                                    <ArrowTrendingDownIcon className="w-4 h-4" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        <p className="text-sm text-slate-500 mt-1">{stat.name}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Overview</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[45, 78, 65, 82, 90, 73, 88, 95, 70, 85, 92, 88].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-slate-100 rounded-t-lg relative group">
                                    <div 
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ${(height * 500).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">User Growth</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[30, 45, 55, 65, 70, 75, 85, 90, 88, 92, 95, 98].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-slate-100 rounded-t-lg relative group">
                                    <div 
                                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {(height * 30).toFixed(0)} users
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Traveler</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Guide</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                                        {booking.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{booking.traveler}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{booking.guide}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{booking.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                        ${booking.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
