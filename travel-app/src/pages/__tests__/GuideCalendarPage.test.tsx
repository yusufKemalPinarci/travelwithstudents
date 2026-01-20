import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GuideCalendarPage from '../GuideCalendarPage'

describe('GuideCalendarPage', () => {
  it('renders calendar header with current month', () => {
    render(<GuideCalendarPage />)
    const date = new Date()
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()
    // Use regex to allow newlines/spaces
    expect(screen.getByText(new RegExp(`${month}.*${year}`, 's'))).toBeInTheDocument()
  })

  it('navigates to the next month', () => {
    render(<GuideCalendarPage />)
    const nextBtn = screen.getAllByRole('button')[1]
    fireEvent.click(nextBtn)
    
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    const nextMonth = date.toLocaleString('en-US', { month: 'long' })
    const nextYear = date.getFullYear()
    
    expect(screen.getByText(new RegExp(`${nextMonth}.*${nextYear}`, 's'))).toBeInTheDocument()
  })

  it('selects a date when clicked', () => {
    render(<GuideCalendarPage />)
    // Find a date cell, e.g., the 15th
    const dayCell = screen.getByText('15')
    fireEvent.click(dayCell)
    
    // Check if it has selected styling (e.g., ring-2)
    // The parent div gets the class. 
    // We can check if the 'Block Date' or 'Set as Available' button appears, which only shows on selection
    const buttons = screen.getAllByRole('button')
    // We expect a new button to appear for blocking validation
    // The title attribute is used for the button: "Block Date" or "Set as Available"
    const actionButton = screen.queryByTitle(/Block Date|Set as Available/i)
    expect(actionButton).toBeInTheDocument()
  })

  it('toggles availability when action button is clicked', () => {
    render(<GuideCalendarPage />)
    const dayCell = screen.getByText('15') 
    fireEvent.click(dayCell) // Select it

    // Assuming 15 is initially available (based on mock data 5, 12, 18, 24 are booked)
    const blockButton = screen.getByTitle('Block Date')
    fireEvent.click(blockButton)

    // After clicking, it should become unavailable, so the button should change to "Set as Available"
    // Note: We might need to re-query or the icon changes.
    // The component updates state.
    expect(screen.getByTitle('Set as Available')).toBeInTheDocument()
  })
})
