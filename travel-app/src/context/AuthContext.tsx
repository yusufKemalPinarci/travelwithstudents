import { createContext, useContext, useState, type ReactNode } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: 'Traveler' | 'Student Guide'
  isEmailVerified: boolean
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  login: (role?: 'Traveler' | 'Student Guide') => void
  logout: () => void
  resendVerification: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const login = (role: 'Traveler' | 'Student Guide' = 'Traveler') => {
    setIsAuthenticated(true)
    setUser({
      id: 'u1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: role,
      isEmailVerified: false // Default to false for testing Task 4
    })
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  const resendVerification = () => {
    console.log('Verification email sent to', user?.email)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, resendVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
