import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GuideDashboardPage from '../GuideDashboard'
import { BrowserRouter } from 'react-router-dom'

// Mock useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn()
    }
})

describe('GuideDashboardPage', () => {
  it('renders without crashing', () => {
    render(
        <BrowserRouter>
            <GuideDashboardPage />
        </BrowserRouter>
    )
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('does NOT display the Student Verification card', () => {
    render(
        <BrowserRouter>
            <GuideDashboardPage />
        </BrowserRouter>
    )
    // I removed this card in a previous step
    expect(screen.queryByText('Student Verification')).not.toBeInTheDocument()
    expect(screen.queryByText(/Your student ID expires/i)).not.toBeInTheDocument()
  })

  it('displays the statistics cards', () => {
    render(
        <BrowserRouter>
            <GuideDashboardPage />
        </BrowserRouter>
    )
    expect(screen.getByText('Total Earnings')).toBeInTheDocument()
    expect(screen.getByText('Profile Views')).toBeInTheDocument()
    expect(screen.getByText('Avg. Rating')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
  })
})
