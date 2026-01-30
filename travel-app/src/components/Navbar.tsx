import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import Button from './Button'
import { getNotifications, markAsRead, type Notification } from '../api/notifications'
import { getImageUrl } from '../utils/image'
import { formatDistanceToNow } from 'date-fns' 
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
    HeartIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline'

const STUDENT_LINKS = [
    { to: '/guide/messages', label: 'Messages' },
    { to: '/guide/calendar', label: 'Calendar' },
]

const TRAVELER_LINKS = [
    { to: '/tours', label: 'Tours' },
    { to: '/search', label: 'Search' },
    { to: '/trips', label: 'My Trips' },
    { to: '/my-requests', label: 'My Requests' },
    { to: '/messages', label: 'Messages' },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const isGuidePanel = location.pathname.startsWith('/guide')
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
        const fetchNotifications = async () => {
            const data = await getNotifications(user.id);
            setNotifications(data);
        };
        fetchNotifications();
        
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
      if (!notification.read) {
          await markAsRead(notification.id);
          setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      }
      setIsNotificationsOpen(false);
  };

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
  } else if (user?.role === 'STUDENT_GUIDE' && isGuidePanel) {
      navItems = STUDENT_LINKS
  } else {
      // Traveler Default - STRICT: No Profile link here, only in Avatar dropdown
      navItems = TRAVELER_LINKS
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to={isGuidePanel ? '/guide' : '/'} className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-semibold bg-primary-600">
                  ST
                </div>
                <div>
                  <p className="text-sm text-slate-500">Travel with Student</p>
                  {user?.role === 'STUDENT_GUIDE' && isGuidePanel && <p className="text-[10px] font-bold text-primary-600 uppercase">Guide Portal</p>}
                </div>
            </Link>
          </div>

          <nav className="hidden md:flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
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
            {isAuthenticated && user?.role === 'STUDENT_GUIDE' && (
                <div className="mr-2">
                    {/* Switcher Button */}
                    {isGuidePanel ? (
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <span className="bg-blue-100 text-blue-600 rounded-full p-1"><UserCircleIcon className="w-3 h-3"/></span>
                            <span className="hidden sm:inline">Switch to</span> Traveler
                        </Link>
                    ) : (
                       <Link 
                            to="/guide/dashboard" 
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                        >
                             <span className="bg-orange-100 text-orange-600 rounded-full p-1"><ArrowRightStartOnRectangleIcon className="w-3 h-3 rotate-180"/></span>
                             <span className="hidden sm:inline">Switch to</span> Student
                        </Link>
                    )}
                </div>
            )}

            {!isAuthenticated ? (
              <>
                <Button as={Link} to="/auth" state={{ mode: 'login' }} variant="ghost" className="hidden sm:inline-flex">
                  Log in
                </Button>
                <Button as={Link} to="/auth" state={{ mode: 'register' }} variant="primary">
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
                         {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                         )}
                     </button>
                     
                     {isNotificationsOpen && (
                         <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden border border-slate-100">
                             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                 <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                 {unreadCount > 0 && (
                                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                                 )}
                             </div>
                             <div className="max-h-96 overflow-y-auto">
                                 {notifications.length > 0 ? (
                                     notifications.slice(0, 5).map((notification) => (
                                         <div 
                                            key={notification.id} 
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-4 py-3 border-b border-slate-50 last:border-0 transition-colors cursor-pointer ${notification.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                         >
                                             <p className={`text-sm text-slate-800 ${!notification.read ? 'font-semibold' : 'font-medium'}`}>{notification.title}</p>
                                             <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                                             <p className="text-[10px] text-slate-400 mt-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                             </p>
                                         </div>
                                     ))
                                 ) : (
                                     <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                         No notifications yet
                                     </div>
                                 )}
                             </div>
                             <Link to="/notifications" className="block p-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors" onClick={() => setIsNotificationsOpen(false)}>
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
                     <Avatar name={user?.name || "User"} src={getImageUrl(user?.profileImage)} size="sm" verified gender={user?.gender} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden border border-slate-100">
                      
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.role === 'STUDENT_GUIDE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {user?.role === 'STUDENT_GUIDE' ? '🎓 Guide' : '✈️ Traveler'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                         {/* Role Specific Items */}
                        {user?.role === 'STUDENT_GUIDE' && isGuidePanel ? (
                          <>
                             <div className="px-3 py-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-3">Student Menu</p>
                                <Link to={`/traveler/${user?.id}`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                  <UserCircleIcon className="w-5 h-5 text-slate-400" /> My Profile
                                </Link>
                                <Link to="/guide/verification" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    <ShieldCheckIcon className="w-5 h-5 text-slate-400" /> Trust & Verification
                                </Link>
                             </div>
                          </>
                        ) : (
                          <>
                             <div className="px-3 py-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-3">Traveler Menu</p>
                                <Link to={`/traveler/${user?.id}`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                  <UserCircleIcon className="w-5 h-5 text-slate-400" /> My Profile
                                </Link>
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
                        )}

                        <div className="my-1 border-t border-slate-100"></div>

                        <div className="px-3 py-1">
                            {user?.role === 'STUDENT_GUIDE' && isGuidePanel ? (
                                <>
                                    <Link 
                                        to="/guide/settings" 
                                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Cog6ToothIcon className="w-5 h-5 text-slate-400" /> Settings
                                    </Link>
                                    <Link 
                                        to="/guide/help" 
                                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400" /> Help & Support
                                    </Link>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
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
                         <Button as={Link} to="/auth" state={{ mode: 'login' }} variant="ghost" fullWidth onClick={() => setIsMobileMenuOpen(false)}>Log in</Button>
                         <Button as={Link} to="/auth" state={{ mode: 'register' }} variant="primary" fullWidth onClick={() => setIsMobileMenuOpen(false)}>Register</Button>
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
