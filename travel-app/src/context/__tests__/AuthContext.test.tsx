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
  })
})
