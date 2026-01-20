import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BookPage from '../pages/Book'
import { BookingProvider } from '../context/BookingContext'

// Mock useNavigate and useParams
const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigate,
        useParams: () => ({ id: 'g1' }),
    }
})

describe('Booking Flow', () => {
    it('renders guide info and disabled continue button initially', () => {
        render(
            <BookingProvider>
                <BrowserRouter>
                    <BookPage />
                </BrowserRouter>
            </BookingProvider>
        )

        expect(screen.getByText('Aisha Karim')).toBeInTheDocument()
        
        const continueBtn = screen.getByRole('button', { name: /continue/i })
        // Check if button is disabled. It might be stylistically disabled or using the disabled attribute.
        // Looking at common Button usage, it might not have 'disabled' attribute if not passed explicitly in props but handled via logic.
        // Let's assume it's disabled. If failing, I'll check Button component.
        expect(continueBtn).toBeDisabled()
    })

    it('enables continue button after selecting date, time, and duration', async () => {
        render(
            <BookingProvider>
                <BrowserRouter>
                    <BookPage />
                </BrowserRouter>
            </BookingProvider>
        )

        // Select Date (pick a day number, e.g. "15")
        const dayButton = screen.getByText('15')
        fireEvent.click(dayButton)

        // Select Time (e.g., "10:00 AM")
        const timeSlot = screen.getByText('10:00 AM')
        fireEvent.click(timeSlot)

        // Select Duration (e.g., "Half Day")
        const durationBtn = screen.getByText('Half Day')
        fireEvent.click(durationBtn)

        const continueBtn = screen.getByRole('button', { name: /continue/i })
        expect(continueBtn).not.toBeDisabled()

        fireEvent.click(continueBtn)
        // Should navigate to summary
        expect(navigate).toHaveBeenCalledWith('/book/summary')
    })
})
