import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CalendarWidget from '../CalendarWidget'

describe('CalendarWidget Component', () => {
  it('renders calendar header with month and year', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    expect(screen.getByText('February 2026')).toBeInTheDocument()
  })

  it('renders all weekday labels', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('renders all days of the month', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    // Check for first and last day
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
  })

  it('calls onDateSelect when a date is clicked', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    const day15 = screen.getByText('15')
    fireEvent.click(day15)
    
    expect(handleDateSelect).toHaveBeenCalledWith('2026-02-15')
  })

  it('highlights selected date', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate="2026-02-15" onDateSelect={handleDateSelect} />)
    
    const day15 = screen.getByText('15')
    expect(day15.className).toContain('bg-primary-600')
    expect(day15.className).toContain('text-white')
  })

  it('renders navigation buttons', () => {
    const handleDateSelect = vi.fn()
    const { container } = render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    const navButtons = container.querySelectorAll('button[type="button"]')
    // Should have prev, next, and day buttons
    expect(navButtons.length).toBeGreaterThan(2)
  })

  it('formats single digit dates with leading zero', () => {
    const handleDateSelect = vi.fn()
    render(<CalendarWidget selectedDate={null} onDateSelect={handleDateSelect} />)
    
    const day5 = screen.getByText('5')
    fireEvent.click(day5)
    
    expect(handleDateSelect).toHaveBeenCalledWith('2026-02-05')
  })
})
