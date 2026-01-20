import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar.tsx'
import Button from '../components/Button.tsx'
import { 
    ArrowRightStartOnRectangleIcon, 
    Cog6ToothIcon, 
    QuestionMarkCircleIcon, 
    ShieldCheckIcon, 
    WalletIcon, 
    EyeIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline'

const guideNavItems = [
  { to: '/guide', label: 'Dashboard' },
  { to: '/guide/inbox', label: 'Messages' },
  { to: '/guide/earnings', label: 'Earnings' },
  { to: '/guide/calendar', label: 'Calendar' },
  { to: '/guide/reviews', label: 'Reviews' },
  { to: '/guide/wallet', label: 'Wallet' },
]

export default function GuideLayout() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  if (user?.role !== 'Student Guide') {
      return <Navigate to="/" replace />
  }

  const menuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-primary-100/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
             <button 
                className="md:hidden p-2 -ml-2 text-slate-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20">
              G
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Guide Portal</p>
              <p className="font-semibold text-slate-900 leading-tight">Travel with Student</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {guideNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
                end={item.to === '/guide'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button as={Link} to="/guide/list-experience" variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700 hidden sm:flex">
                + Create Tour
            </Button>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="flex items-center gap-2 focus:outline-none"
                aria-label="User menu"
              >
                 <Avatar name={user?.name || "Guide User"} size="sm" verified />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden border border-slate-100">
                  
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            🎓 Guide
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                       <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-slate-600">Status</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-emerald-600 font-bold">Online</span>
                            <div className="w-8 h-4 bg-emerald-100 rounded-full relative cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                            </div>
                          </div>
                       </div>
                  </div>

                  <div className="py-2">
                     <div className="px-3 py-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-3">Student Menu</p>
                        <Link to={`/profile/${user?.id}`} target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <EyeIcon className="w-5 h-5 text-slate-400" /> View Public Profile
                        </Link>
                        <Link to="/guide/edit-profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <PencilSquareIcon className="w-5 h-5 text-slate-400" /> Edit Profile
                        </Link>
                        <Link to="/guide/wallet" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <WalletIcon className="w-5 h-5 text-slate-400" /> Wallet & Earnings
                        </Link>
                        <Link to="/verification" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <ShieldCheckIcon className="w-5 h-5 text-slate-400" /> Trust & Verification
                        </Link>
                     </div>

                    <div className="my-1 border-t border-slate-100"></div>

                    <div className="px-3 py-1">
                        <Link 
                            to="/settings" 
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Cog6ToothIcon className="w-5 h-5 text-slate-400" /> Settings
                        </Link>
                         <Link 
                            to="/help" 
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400" /> Help & Support
                        </Link>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
                       <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-red-500" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

         {/* Mobile Navigation Dropdown */}
         {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
                {guideNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-orange-50 text-orange-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`
                        }
                        end={item.to === '/guide'}
                    >
                        {item.label}
                    </NavLink>
                ))}
                 <div className="pt-4 mt-2 border-t border-slate-100 grid gap-2">
                     <Button as={Link} to="/guide/list-experience" variant="primary" fullWidth className="bg-orange-600 hover:bg-orange-700">
                        + Create Tour
                     </Button>
                     <Button as={Link} to="/guide/verification" variant="ghost" fullWidth>Verification</Button>
                     <Button as={Link} to="/settings" variant="ghost" fullWidth>Settings</Button>
                </div>
            </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
