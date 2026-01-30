import apiClient from './client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  profileImage: string
  createdAt: string
  guideProfile?: any
}

export interface Transaction {
  id: string
  travelerId: string
  travelerName: string
  travelerEmail: string
  guideId: string
  guideName: string
  date: string
  totalAmount: number
  platformFee: number
  guideEarnings: number
  status: string
  createdAt: string
}

export const getAllUsers = async (filters?: {
  role?: string
  status?: string
  search?: string
}): Promise<User[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)

    const response = await apiClient.get(`/admin/users?${params}`)
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const updateUserStatus = async (userId: string, status: string): Promise<boolean> => {
  try {
    await apiClient.put(`/admin/users/${userId}/status`, { status })
    return true
  } catch (error) {
    console.error('Error updating user status:', error)
    return false
  }
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/admin/users/${userId}`)
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export const getAllTransactions = async (filters?: {
  status?: string
  guideId?: string
}): Promise<Transaction[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.guideId) params.append('guideId', filters.guideId)

    const response = await apiClient.get(`/admin/transactions?${params}`)
    return response.data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export const getAllReviews = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/admin/reviews')
    return response.data
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/admin/reviews/${reviewId}`)
    return true
  } catch (error) {
    console.error('Error deleting review:', error)
    return false
  }
}

export const getAllBookings = async (filters?: {
  status?: string
  guideId?: string
  travelerId?: string
}): Promise<any[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.guideId) params.append('guideId', filters.guideId)
    if (filters?.travelerId) params.append('travelerId', filters.travelerId)

    const response = await apiClient.get(`/admin/bookings?${params}`)
    return response.data
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

export const updateBookingStatus = async (bookingId: string, status: string): Promise<boolean> => {
  try {
    await apiClient.put(`/admin/bookings/${bookingId}/status`, { status })
    return true
  } catch (error) {
    console.error('Error updating booking status:', error)
    return false
  }
}
