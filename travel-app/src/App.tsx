import { Outlet } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import { AuthProvider } from './context/AuthContext'

function AppShell() {
  return (
    <AuthProvider>
      <BookingProvider>
        <div className="app-shell">
          <Outlet />
        </div>
      </BookingProvider>
    </AuthProvider>
  )
}

export default AppShell
