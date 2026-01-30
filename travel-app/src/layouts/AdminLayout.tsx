import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { 
    HomeIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    StarIcon,
    BanknotesIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'

const adminNavItems = [
    { to: '/admin', label: 'Dashboard', icon: HomeIcon },
    { to: '/admin/users', label: 'Users', icon: UsersIcon },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarDaysIcon },
    { to: '/admin/reviews', label: 'Reviews', icon: StarIcon },
    { to: '/admin/transactions', label: 'Transactions', icon: BanknotesIcon },
    { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
]

export default function AdminLayout() {
    const { user, logout, loginAsAdmin } = useAuth()
    const navigate = useNavigate()

    // TODO: Canlıya alırken bu kısmı kaldır ve AdminLogin yönlendirmesini aktif et
    // Auto-login as admin for development
    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            loginAsAdmin()
        }
    }, [user, loginAsAdmin])

    // PRODUCTION: Canlıya alırken aşağıdaki kodu aktif et, yukarıdakini kaldır
    // useEffect(() => {
    //     if (!user || user.role !== 'Admin') {
    //         navigate('/admin/login')
    //     }
    // }, [user, navigate])

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Travel with Student</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
