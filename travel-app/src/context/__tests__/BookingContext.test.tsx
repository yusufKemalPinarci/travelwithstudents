import { renderHook, act } from '@testing-library/react'
import { BookingProvider, useBooking } from '../BookingContext'
import { describe, it, expect } from 'vitest'

describe('BookingContext', () => {
  it('Initial State: All booking fields should be null or default', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    expect(result.current.guideId).toBeNull()
    expect(result.current.date).toBeNull()
    expect(result.current.time).toBeNull()
    expect(result.current.duration).toBeNull()
    expect(result.current.price).toBe(0)
    expect(result.current.notes).toBe('')
  })

  it('Set Booking Details: Updates booking state correctly', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    act(() => {
      result.current.setBookingDetails({
        guideId: 'guide1',
        date: '2026-02-15',
        time: '10:00 AM',
        duration: 'Half Day',
        price: 150,
      })
    })

    expect(result.current.guideId).toBe('guide1')
    expect(result.current.date).toBe('2026-02-15')
    expect(result.current.time).toBe('10:00 AM')
    expect(result.current.duration).toBe('Half Day')
    expect(result.current.price).toBe(150)
  })

  it('Partial Update: Updates only specified fields', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    act(() => {
      result.current.setBookingDetails({
        guideId: 'guide1',
        price: 100,
      })
    })

    expect(result.current.guideId).toBe('guide1')
    expect(result.current.price).toBe(100)
    expect(result.current.date).toBeNull()
    expect(result.current.time).toBeNull()
  })

  it('Set Notes: Updates notes field', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    act(() => {
      result.current.setBookingDetails({
        notes: 'Special request for morning tour',
      })
    })

    expect(result.current.notes).toBe('Special request for morning tour')
  })

  it('Reset Booking: Clears all booking data', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    // Set some data first
    act(() => {
      result.current.setBookingDetails({
        guideId: 'guide1',
        date: '2026-02-15',
        time: '10:00 AM',
        duration: 'Full Day',
        price: 250,
        notes: 'Test notes',
      })
    })

    expect(result.current.guideId).toBe('guide1')
    expect(result.current.price).toBe(250)

    // Reset
    act(() => {
      result.current.resetBooking()
    })

    expect(result.current.guideId).toBeNull()
    expect(result.current.date).toBeNull()
    expect(result.current.time).toBeNull()
    expect(result.current.duration).toBeNull()
    expect(result.current.price).toBe(0)
    expect(result.current.notes).toBe('')
  })

  it('Full Day Booking: Sets correct duration and price', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    act(() => {
      result.current.setBookingDetails({
        duration: 'Full Day',
        price: 300,
      })
    })

    expect(result.current.duration).toBe('Full Day')
    expect(result.current.price).toBe(300)
  })

  it('Multiple Updates: Preserves previous state', () => {
    const { result } = renderHook(() => useBooking(), {
      wrapper: BookingProvider,
    })

    act(() => {
      result.current.setBookingDetails({
        guideId: 'guide1',
      })
    })

    act(() => {
      result.current.setBookingDetails({
        date: '2026-02-15',
      })
    })

    act(() => {
      result.current.setBookingDetails({
        time: '10:00 AM',
      })
    })

    expect(result.current.guideId).toBe('guide1')
    expect(result.current.date).toBe('2026-02-15')
    expect(result.current.time).toBe('10:00 AM')
  })
})
