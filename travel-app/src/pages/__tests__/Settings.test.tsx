import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Settings from '../Settings'
import { AuthContext } from '../../context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock Auth Context
const mockUser = {
    name: 'Test Guide',
    email: 'test@example.com',
    role: 'Student Guide',
    isEmailVerified: true
}

const mockLogout = vi.fn()
const mockLogin = vi.fn()
const mockResendVerification = vi.fn()

const renderWithAuth = (ui: React.ReactNode, authValue = {}) => {
    return render(
        <AuthContext.Provider value={{ 
            user: mockUser, 
            isAuthenticated: true, 
            logout: mockLogout, 
            login: mockLogin,
            resendVerification: mockResendVerification,
            ...authValue 
        }}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </AuthContext.Provider>
    )
}

describe('Settings Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders user profile information', () => {
        renderWithAuth(<Settings />)
        expect(screen.getByText('Test Guide')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('shows Verified badge logic for Student Guide', () => {
        renderWithAuth(<Settings />)
        expect(screen.getByText('Verified student email cannot be changed here.')).toBeInTheDocument()
    })

    it('renders all sections', () => {
        renderWithAuth(<Settings />)
        expect(screen.getByText('Contact Information')).toBeInTheDocument()
        expect(screen.getByText('General')).toBeInTheDocument()
        expect(screen.getByText('Notifications')).toBeInTheDocument()
        expect(screen.getByText('Security')).toBeInTheDocument()
    })

    it('renders danger zone', () => {
        renderWithAuth(<Settings />)
        expect(screen.getByText('Danger Zone')).toBeInTheDocument()
        expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })
})
