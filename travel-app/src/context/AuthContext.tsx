import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  login as apiLogin, 
  register as apiRegister, 
  googleLogin as apiGoogleLogin,
  getUserProfile, 
  type User, 
  type LoginData, 
  type RegisterData,
  type GoogleLoginData
} from '../api/auth'
import { jwtDecode } from 'jwt-decode' // We might need this to get ID from token if profile fetch fails or initial load

// Use User type from api/auth directly
// But we need to make sure the rest of the app can handle the role enums
// or we map them here. For now, let's use the API types as source of truth.

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User | null) => void
  login: (data: LoginData) => Promise<{ success: boolean; message?: string; user?: User }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; user?: User }>
  loginWithGoogle: (data: GoogleLoginData) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  resendVerification: () => void
  loginAsAdmin: (data: LoginData) => Promise<{ success: boolean; message?: string }>
  wishlist: string[]
  toggleWishlist: (guideId: string) => void
  isInWishlist: (guideId: string) => boolean
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          // Check if token is expired
          const decoded: any = jwtDecode(token)
          const currentTime = Date.now() / 1000
          
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired
            console.log('Token expired, logging out')
            localStorage.removeItem('authToken')
            setIsAuthenticated(false)
            setUser(null)
            setLoading(false)
            return
          }
          
          // Token is valid, fetch user profile
          if (decoded && decoded.id) {
             const userData = await getUserProfile(decoded.id)
             if (userData) {
               setUser(userData)
               setIsAuthenticated(true)
             } else {
                // Profile fetch failed but token is valid
                // Keep token and set basic user info from token
                console.warn('Could not fetch user profile, using token data')
                setUser({
                  id: decoded.id,
                  email: decoded.email || '',
                  name: decoded.name || 'User',
                  role: decoded.role || 'TRAVELER',
                  isEmailVerified: decoded.isEmailVerified || false,
                } as User)
                setIsAuthenticated(true)
             }
          } else {
            // Invalid token structure
            localStorage.removeItem('authToken')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error("Failed to load user", error)
          // If token is corrupted or decode fails, remove it
          localStorage.removeItem('authToken')
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const login = async (data: LoginData) => {
    try {
      const response = await apiLogin(data)
      if (response && response.token) {
        setIsAuthenticated(true)
        setUser(response.user)
        return { success: true, user: response.user }
      }
      return { success: false, message: 'Login failed' }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred during login';
      return { success: false, message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await apiRegister(data)
      if (response && response.token) {
        setIsAuthenticated(true)
        setUser(response.user)
        return { success: true, user: response.user }
      }
      return { success: false, message: 'Registration failed' }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred during registration';
      return { success: false, message }
    }
  }

  const loginWithGoogle = async (data: GoogleLoginData) => {
    try {
      const response = await apiGoogleLogin(data)
      if (response && response.token) {
        setIsAuthenticated(true)
        setUser(response.user)
        return { success: true, user: response.user }
      }
      return { success: false, message: 'Google login failed' }
    } catch (error) {
        return { success: false, message: 'An error occurred' }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    setUser(null)
    setWishlist([])
    navigate('/')
  }

  // Admin login is just a login with role check, but reusing the main login function
  const loginAsAdmin = async (data: LoginData) => {
     return login(data)
  }

  const resendVerification = () => {
    console.log('Verification email sent to', user?.email)
  }

  const toggleWishlist = (guideId: string) => {
    setWishlist(prev => {
      if (prev.includes(guideId)) {
        return prev.filter(id => id !== guideId)
      } else {
        return [...prev, guideId]
      }
    })
  }

  const isInWishlist = (guideId: string) => {
    return wishlist.includes(guideId)
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      setUser,
      login, 
      register,
      loginWithGoogle,
      logout,
      resendVerification, 
      loginAsAdmin,
      wishlist,
      toggleWishlist,
      isInWishlist,
      loading
    }}>
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
