import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
    ShieldCheckIcon, 
    ExclamationTriangleIcon,
    LockClosedIcon,
    UserIcon
} from '@heroicons/react/24/outline'


const MAX_ATTEMPTS = 3
const LOCKOUT_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [lockedUntil, setLockedUntil] = useState<number | null>(null)
    const [remainingTime, setRemainingTime] = useState(0)
    const navigate = useNavigate()
    const { loginAsAdmin, user } = useAuth()

    // Check if already logged in as admin
    useEffect(() => {
        if (user?.role === 'Admin') {
            navigate('/admin')
        }
    }, [user, navigate])

    // Check lockout status on mount
    useEffect(() => {
        const savedLockout = localStorage.getItem('adminLockoutTime')
        const savedAttempts = localStorage.getItem('adminAttempts')
        
        if (savedLockout) {
            const lockoutTime = parseInt(savedLockout)
            if (Date.now() < lockoutTime) {
                setLockedUntil(lockoutTime)
            } else {
                localStorage.removeItem('adminLockoutTime')
                localStorage.removeItem('adminAttempts')
            }
        }
        
        if (savedAttempts) {
            setAttempts(parseInt(savedAttempts))
        }
    }, [])

    // Update remaining time
    useEffect(() => {
        if (lockedUntil) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
                setRemainingTime(remaining)
                
                if (remaining === 0) {
                    setLockedUntil(null)
                    setAttempts(0)
                    setError('')
                    localStorage.removeItem('adminLockoutTime')
                    localStorage.removeItem('adminAttempts')
                }
            }, 1000)
            
            return () => clearInterval(interval)
        }
    }, [lockedUntil])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Check if account is locked
        if (lockedUntil && Date.now() < lockedUntil) {
            const remainingMinutes = Math.ceil((lockedUntil - Date.now()) / 60000)
            setError(`Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`)
            return
        }

        // Attempt login via API
        const result = await loginAsAdmin({ email: username, password })
        
        if (result.success) {
            // Successful login
            localStorage.removeItem('adminAttempts')
            localStorage.removeItem('adminLockoutTime')
            navigate('/admin')
        } else {
            // Failed login
            const newAttempts = attempts + 1
            setAttempts(newAttempts)
            localStorage.setItem('adminAttempts', newAttempts.toString())
            setError(result.message || 'Invalid credentials')
            
            if (newAttempts >= MAX_ATTEMPTS) {
                // Lock account
                const lockoutTime = Date.now() + LOCKOUT_TIME
                setLockedUntil(lockoutTime)
                localStorage.setItem('adminLockoutTime', lockoutTime.toString())
                setError(`Too many failed attempts. Account locked for 5 minutes.`)
            } else {
                const remaining = MAX_ATTEMPTS - newAttempts
                setError(`Invalid username or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`)
            }
            
            // Clear password field
            setPassword('')
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isLocked = lockedUntil && Date.now() < lockedUntil

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <ShieldCheckIcon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white text-center">Admin Portal</h1>
                        <p className="text-blue-100 text-sm text-center mt-1">Travel with Student</p>
                    </div>

                    {/* Login Form */}
                    <div className="px-8 py-8">
                        {isLocked && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900">Account Locked</p>
                                    <p className="text-xs text-red-700 mt-1">
                                        Too many failed login attempts. Please wait {formatTime(remainingTime)} before trying again.
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && !isLocked && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900">Login Failed</p>
                                    <p className="text-xs text-amber-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLocked}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        placeholder="Enter admin username"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLocked}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        placeholder="Enter admin password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            {attempts > 0 && !isLocked && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Failed attempts: {attempts}/{MAX_ATTEMPTS}</span>
                                    <span className="text-red-600 font-medium">{MAX_ATTEMPTS - attempts} remaining</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLocked}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                            >
                                {isLocked ? `Locked - Wait ${formatTime(remainingTime)}` : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-xs text-center text-slate-500">
                                This is a secure admin portal. Unauthorized access attempts are logged and monitored.
                            </p>
                        </div>

                        {/* Demo Credentials (only for development) */}
                        <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-medium text-slate-700 mb-2">Demo Credentials:</p>
                            <p className="text-xs text-slate-600 font-mono">Username: admin</p>
                            <p className="text-xs text-slate-600 font-mono">Password: admin123</p>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="mt-4 text-center text-xs text-slate-400">
                    <p>Protected by rate limiting and account lockout security</p>
                </div>
            </div>
        </div>
    )
}
