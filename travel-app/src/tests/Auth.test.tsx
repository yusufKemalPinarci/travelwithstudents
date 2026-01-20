import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AuthPage from '../pages/Auth'

// Mock useNavigate
const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigate,
    }
})

import { AuthProvider } from '../context/AuthContext'

describe('Auth Flow', () => {
    it('renders login form by default', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            </BrowserRouter>
        )
        // headline is "Welcome back" for login
        expect(screen.getByText('Welcome back')).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('allows typing in email and password', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput.value).toBe('test@example.com')
        expect(passwordInput.value).toBe('password123')
    })

    it('submits the form and navigates on success', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            </BrowserRouter>
        )

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        // It has a fake delay
        await waitFor(() => {
             // By default role is Traveler, so it goes to '/'
             expect(navigate).toHaveBeenCalledWith('/', { replace: true }) 
        }, { timeout: 1000 })
    })
})
