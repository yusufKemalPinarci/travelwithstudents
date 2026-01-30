import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BookingCard from '../BookingCard'
import type { Booking } from '../../types'

const mockBooking: Booking = {
  id: '1',
  guide: {
    id: 'g1',
    name: 'John Doe',
    city: 'Istanbul',
    image: '/guide.jpg',
    university: 'Istanbul University',
    price: 50,
    rating: 4.5,
    reviews: 120,
    bio: 'Test bio',
    languages: ['English'],
    responseTime: '1 hour',
    verified: true,
  },
  date: '2026-02-15',
  time: '10:00 AM',
  duration: '3 hours',
  price: 150,
  status: 'upcoming',
  hasReview: false,
}

describe('BookingCard Component', () => {
  it('renders booking information correctly', () => {
    render(<BookingCard booking={mockBooking} />)
    
    expect(screen.getByText('Tour with John Doe')).toBeInTheDocument()
    expect(screen.getByText('2026-02-15 • 10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('3 hours')).toBeInTheDocument()
    expect(screen.getByText('Istanbul')).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<BookingCard booking={mockBooking} />)
    
    expect(screen.getByText('upcoming')).toBeInTheDocument()
    const statusBadge = screen.getByText('upcoming')
    expect(statusBadge.className).toContain('bg-emerald-100')
  })

  it('shows cancel and manage buttons for upcoming bookings', () => {
    render(<BookingCard booking={mockBooking} />)
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Manage Booking')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn()
    render(<BookingCard booking={mockBooking} onCancel={handleCancel} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleCancel).toHaveBeenCalledWith(mockBooking)
  })

  it('shows review button for completed bookings without review', () => {
    const completedBooking = { ...mockBooking, status: 'completed' as const }
    render(<BookingCard booking={completedBooking} />)
    
    expect(screen.getByText('Rate & Review')).toBeInTheDocument()
  })

  it('calls onReview when review button is clicked', () => {
    const handleReview = vi.fn()
    const completedBooking = { ...mockBooking, status: 'completed' as const }
    render(<BookingCard booking={completedBooking} onReview={handleReview} />)
    
    fireEvent.click(screen.getByText('Rate & Review'))
    expect(handleReview).toHaveBeenCalledWith(completedBooking)
  })

  it('shows rebook button for cancelled bookings', () => {
    const cancelledBooking = { ...mockBooking, status: 'cancelled' as const }
    render(<BookingCard booking={cancelledBooking} />)
    
    expect(screen.getByText('Rebook')).toBeInTheDocument()
  })

  it('renders guide image correctly', () => {
    render(<BookingCard booking={mockBooking} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/guide.jpg')
    expect(image).toHaveAttribute('alt', 'John Doe')
  })
})
