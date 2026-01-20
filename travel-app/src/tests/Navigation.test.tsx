import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

describe('Navigation Flow', () => {
    it('renders all nav links correctly', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <DashboardLayout />
                </AuthProvider>
            </BrowserRouter>
        )

        const homeLink = screen.getByRole('link', { name: /home/i })
        const searchLink = screen.getByRole('link', { name: /search/i })
        
        expect(homeLink).toHaveAttribute('href', '/')
        expect(searchLink).toHaveAttribute('href', '/search')
    })
})
