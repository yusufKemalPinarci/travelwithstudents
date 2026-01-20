import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type BookingState = {
  guideId: string | null
  date: string | null
  time: string | null
  duration: 'Half Day' | 'Full Day' | null
  price: number
  notes: string
}

type BookingContextType = BookingState & {
  setBookingDetails: (details: Partial<BookingState>) => void
  resetBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>({
    guideId: null,
    date: null,
    time: null,
    duration: null,
    price: 0,
    notes: '',
  })

  const setBookingDetails = (details: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...details }))
  }

  const resetBooking = () => {
    setState({
      guideId: null,
      date: null,
      time: null,
      duration: null,
      price: 0,
      notes: '',
    })
  }

  return (
    <BookingContext.Provider value={{ ...state, setBookingDetails, resetBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
