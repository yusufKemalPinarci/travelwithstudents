import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import Button from './Button'
import { 
    BellIcon, 
    ArrowRightStartOnRectangleIcon, 
    Cog6ToothIcon, 
    QuestionMarkCircleIcon, 
    ShieldCheckIcon, 
    WalletIcon, 
    EyeIcon,
    PencilSquareIcon,
    TicketIcon,
    HeartIcon
} from '@heroicons/react/24/outline'

const STUDENT_LINKS = [
    { to: '/guide/dashboard', label: 'Dashboard' },
    { to: '/guide/inbox', label: 'Messages' }, // or just /inbox if shared? GuideLayout uses /guide/inbox
    { to: '/guide/earnings', label: 'Earnings' },
    { to: '/guide/wallet', label: 'Wallet' },
    { to: '/guide/calendar', label: 'Calendar' },
]

const TRAVELER_LINKS = [
    { to: '/search', label: 'Search' },
    { to: '/trips', label: 'My Trips' },
    { to: '/inbox', label: 'Inbox' },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  // Task 1 & 3: Role-Based Link Logic
  let navItems = []
  
  if (!isAuthenticated) {
      navItems = [
          { to: '/', label: 'Home' },
          { to: '/search', label: 'Search' },
      ]
  } else if (user?.role === 'Student Guide') {
      navItems = STUDENT_LINKS
  } else {
      // Traveler Default - STRICT: No Profile link here, only in Avatar dropdown
      navItems = TRAVELER_LINKS
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 -ml-2 text-slate-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to={user?.role === 'Student Guide' ? '/guide' : '/'} className="flex items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-semibold ${user?.role === 'Student Guide' ? 'bg-orange-600' : 'bg-primary-600'}`}>
                  {user?.role === 'Student Guide' ? 'G' : 'ST'}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Travel with Student</p>
                  {user?.role === 'Student Guide' && <p className="text-[10px] font-bold text-orange-600 uppercase">Guide Portal</p>}
                </div>
            </Link>
          </div>

          <nav className="hidden md:flex gap-1 bg-slate-100/50 p-1 rounded-xl">
             {navItems.map((item) => (
               <NavLink
                 key={item.to}
                 to={item.to}
                 className={({ isActive }) =>
                   `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                     isActive
                       ? 'bg-white text-primary-700 shadow-sm'
                       : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                   }`
                 }
                 end={item.to === '/' || item.to === '/guide'}
               >
                 {item.label}
               </NavLink>
             ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <>
                <Button as={Link} to="/auth" variant="ghost" className="hidden sm:inline-flex">
                  Log in
                </Button>
                <Button as={Link} to="/auth" variant="primary">
                  Register
                </Button>
              </>
            ) : (
               <div className="flex items-center gap-3">
                 {/* Notification Bell */}
                 <div className="relative" ref={notificationRef}>
                     <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none"
                        aria-label="Notifications"
                     >
                         <BellIcon className="w-6 h-6" />
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                     </button>
                     
                     {isNotificationsOpen && (
                         <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden border border-slate-100">
                             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                 <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                 <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">2 New</span>
                             </div>
                             <div className="max-h-96 overflow-y-auto">
                                 {[1, 2].map((i) => (
                                     <div key={i} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-pointer">
                                         <p className="text-sm text-slate-800 font-medium">New Booking Request</p>
                                         <p className="text-xs text-slate-500 mt-1">Isabella requested a tour for "Historical Peninsula".</p>
                                         <p className="text-[10px] text-slate-400 mt-2">2 hours ago</p>
                                     </div>
                                 ))}
                             </div>
                             <Link to="/notifications" className="block p-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                                 View all notifications
                             </Link>
                         </div>
                     )}
                 </div>

                 <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="flex items-center gap-2 focus:outline-none"
                    aria-label="User menu"
                  >
                     <Avatar name={user?.name || "User"} size="sm" verified />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden border border-slate-100">
                      
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.role === 'Student Guide' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {user?.role === 'Student Guide' ? '🎓 Guide' : '✈️ Traveler'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                         {/* Role Specific Items */}
                        {user?.role === 'Traveler' ? (
                          <>
                             <div className="px-3 py-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-3">Traveler Menu</p>
                                <Link to="/trips" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                  <TicketIcon className="w-5 h-5 text-slate-400" /> My Trips
                                </Link>
                                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                  <HeartIcon className="w-5 h-5 text-slate-400" /> Saved Guides
                                </Link>
                                <Link to="/verification" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                  <ShieldCheckIcon className="w-5 h-5 text-slate-400" /> Trust & Verification
                                </Link>
                             </div>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}

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
            )}
            

            {!isAuthenticated && (
                <div className="sm:hidden">
                   <Avatar name="Guest" size="sm" />
                </div>
            )}
          </div>
        </div>


        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`
                        }
                        end={item.to === '/'}
                    >
                        {item.label}
                    </NavLink>
                ))}
                <div className="pt-4 mt-2 border-t border-slate-100 grid gap-2">
                    {!isAuthenticated ? (
                       <>
                         <Button as={Link} to="/auth" variant="ghost" fullWidth onClick={() => setIsMobileMenuOpen(false)}>Log in</Button>
                         <Button as={Link} to="/auth" variant="primary" fullWidth onClick={() => setIsMobileMenuOpen(false)}>Register</Button>
                       </>
                    ) : (
                         <Button variant="ghost" fullWidth onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Log out</Button>
                    )}
                </div>
            </div>
        )}
      </header>
  )
}
