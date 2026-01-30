import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { describe, it, expect } from 'vitest'

describe('AuthContext', () => {
  it('Initial State: Verify that user is null and isAuthenticated is false by default', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.wishlist).toEqual([])
  })

  it('Login Action: Call the login() function and assert that isAuthenticated becomes true', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login('Traveler')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.role).toBe('Traveler')
  })

  it('Login as Student Guide: Sets correct role', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login('Student Guide')
    })

    expect(result.current.user?.role).toBe('Student Guide')
  })

  it('Login as Admin: Sets admin role correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      result.current.loginAsAdmin()
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.role).toBe('Admin')
    expect(result.current.user?.isEmailVerified).toBe(true)
  })

  it('Logout Action: Call logout(), then assert that user becomes null', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    // First login
    await act(async () => {
      await result.current.login('Traveler')
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    await act(async () => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.wishlist).toEqual([])
  })

  it('Wishlist: Add guide to wishlist', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    act(() => {
      result.current.toggleWishlist('guide1')
    })

    expect(result.current.wishlist).toContain('guide1')
    expect(result.current.isInWishlist('guide1')).toBe(true)
  })

  it('Wishlist: Remove guide from wishlist', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    act(() => {
      result.current.toggleWishlist('guide1')
    })
    expect(result.current.isInWishlist('guide1')).toBe(true)

    act(() => {
      result.current.toggleWishlist('guide1')
    })

    expect(result.current.wishlist).not.toContain('guide1')
    expect(result.current.isInWishlist('guide1')).toBe(false)
  })

  it('Wishlist: Handles multiple guides', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    act(() => {
      result.current.toggleWishlist('guide1')
      result.current.toggleWishlist('guide2')
      result.current.toggleWishlist('guide3')
    })

    expect(result.current.wishlist).toHaveLength(3)
    expect(result.current.isInWishlist('guide1')).toBe(true)
    expect(result.current.isInWishlist('guide2')).toBe(true)
    expect(result.current.isInWishlist('guide3')).toBe(true)
  })

  it('Wishlist: Clears on logout', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      result.current.login('Traveler')
    })

    act(() => {
      result.current.toggleWishlist('guide1')
      result.current.toggleWishlist('guide2')
    })

    expect(result.current.wishlist).toHaveLength(2)

    await act(async () => {
      result.current.logout()
    })

    expect(result.current.wishlist).toEqual([])
  })
})
