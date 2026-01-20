import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect } from 'vitest'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthPage from '../pages/Auth'
import RequireAuth from '../components/RequireAuth'

// Mock components to simplify tree
const MockProtectedPage = () => <div>Protected Content</div>
const MockPublicPage = () => <div>Public Content</div>

const AppWithAuth = ({ initialEntries = ['/'] }: { initialEntries: string[] }) => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <MockPublicPage /> }
      ]
    },
    {
      path: '/auth',
      element: <AuthPage />
    },
    {
      path: '/protected',
      element: (
        <RequireAuth>
            <MockProtectedPage />
        </RequireAuth>
      )
    }
  ], {
    initialEntries
  })

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

describe('Authentication Flow', () => {

  it('shows Login button when not authenticated', () => {
    render(<AppWithAuth initialEntries={['/']} />)
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.queryByText('Log out')).not.toBeInTheDocument()
  })

  it('redirects to /auth when accessing protected route', () => {
    render(<AppWithAuth initialEntries={['/protected']} />)
    // Should be redirected to auth page
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument() // "We're glad to see you again" or similar
  })

  it('login updates state and navigation', async () => {
    // Note: This test implies integration with the actual AuthPage form
    // Since AuthPage uses a timeout, we need to wait
    
    render(<AppWithAuth initialEntries={['/auth']} />)
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    
    // Click login
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    
    // Wait for "API"
    await waitFor(() => {
        // Should redirect to home (default)
        expect(screen.getByText('Public Content')).toBeInTheDocument()
    }, { timeout: 2000 }) 
    
    // Open user menu
    const userMenuBtn = screen.getByLabelText('User menu')
    fireEvent.click(userMenuBtn)
    
    // Header should now show Logout
    expect(screen.getByText(/Log out/i)).toBeInTheDocument()
  })

})
