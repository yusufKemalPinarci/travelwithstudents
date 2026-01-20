import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Navbar from '../Navbar'
import { BrowserRouter } from 'react-router-dom'
import * as AuthContextModule from '../../context/AuthContext'

// Mocking the context hook
const useAuthSpy = vi.spyOn(AuthContextModule, 'useAuth')

describe('Navbar Component', () => {
  it('Guest View: Render Navbar with isAuthenticated = false. Assert that Login and Register buttons are visible', () => {
    // Mock Guest State
    useAuthSpy.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      resendVerification: vi.fn()
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    // Check for Login/Register buttons
    expect(screen.getByText(/Log in/i)).toBeInTheDocument()
    expect(screen.getByText(/Register/i)).toBeInTheDocument()
    
    // Check that User Avatar (logged in view) is NOT present (or at least the specific one)
    // Actually the Guest view also has a mobile menu button, but the specific user menu should be absent.
    // The "ST" logo text should be visible
    expect(screen.getByText('Travel with Student')).toBeInTheDocument()
  })

  it('User View: Render Navbar with isAuthenticated = true. Assert that Login is gone and User Avatar is visible', () => {
    // Mock User State
    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'Traveler', isEmailVerified: true },
      login: vi.fn(),
      logout: vi.fn(),
      resendVerification: vi.fn()
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    // Login/Register should NOT be visible (desktop)
    // Note: Mobile menu might have them hidden, but let's check desktop view logic
    // The code renders buttons conditionally on !isAuthenticated
    
    expect(screen.queryByText(/Log in/i)).not.toBeInTheDocument()
    
    // User Avatar (or at least visual indication)
    // The Avatar component renders the initials. For "Test User", maybe "TU"?
    // Or we can check for notification bell which is only visible when authenticated.
    // Actually simpler: Notification Bell is a good proxy.
    // Or check if the button with Avatar exists.
    
    // Check for specific authenticated-only elements
    const notificationsButton = screen.getByLabelText(/Notifications/i)
    expect(notificationsButton).toBeInTheDocument()
    
    const userMenuButton = screen.getByLabelText(/User menu/i)
    expect(userMenuButton).toBeInTheDocument()
  })
})
