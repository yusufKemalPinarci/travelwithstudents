import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthPage from '../Auth'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext' 

// Mock useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigateMock
    }
})

describe('RegisterPage (AuthPage)', () => {
  it('Edu Mail Validation: Error for invalid email for Student Guide', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
            <AuthPage />
        </AuthProvider>
      </BrowserRouter>
    )

    // Switch to Register mode
    fireEvent.click(screen.getByText(/Sign up/i))

    // Select Student Guide role
    fireEvent.click(screen.getByText('Student Guide'))

    // Type invalid email
    const emailInput = screen.getByLabelText(/Email address/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    
    // Type password
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } })
    
    // Auth.tsx renders confirm password only in register mode
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } })
    
    // Click Register
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Assert Error
    expect(await screen.findByText(/Student guides must register with a valid university email/i)).toBeInTheDocument()
  })
})
