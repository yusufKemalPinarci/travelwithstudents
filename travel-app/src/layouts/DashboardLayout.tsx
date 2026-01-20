import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer.tsx'
import Navbar from '../components/Navbar.tsx'
import { useAuth } from '../context/AuthContext.tsx'

export default function DashboardLayout() {
  const { isAuthenticated, user, resendVerification } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Email Verification Banner */}
      {isAuthenticated && user?.isEmailVerified === false && (
        <div className="bg-yellow-50 text-yellow-800 px-4 py-2 text-sm text-center font-medium border-b border-yellow-200 flex items-center justify-center gap-2">
            <span>Your email is not verified. Please check your inbox.</span>
            <button 
                onClick={resendVerification}
                className="underline hover:text-yellow-900 font-bold"
            >
                Resend Link
            </button>
        </div>
      )}

      <Navbar />

      <main className="mx-auto max-w-6xl p-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-300px)]">
        <Outlet />
      </main>
      
      {/* Only show Footer for Traveler views or if we are not a student guide to avoid clutter? 
          Actually commonly footer is fine everywhere. */}
      <Footer />
    </div>
  )
}
