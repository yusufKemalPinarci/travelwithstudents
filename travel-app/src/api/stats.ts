import apiClient from './client'

export interface GuideStats {
  level: number
  levelTitle: string
  currentXp: number
  nextLevelXp: number
  isAvailable: boolean
  totalEarnings: number
  profileViews: number
  rating: number
  totalReviews: number
  completionRate: string
  totalBookings: number
  earningsHistory: Array<{
    month: string
    amount: number
  }>
  upcomingBookings: Array<{
    id: string
    travelerName: string
    travelerImage: string
    tourName: string
    date: string
    time: string
    duration: string
    guests: number
    price: number
    status: string
  }>
  recentTransactions: Array<{
    id: string
    tourName: string
    date: string
    amount: number
    status: string
  }>
  recentReviews: Array<{
    id: string
    travelerName: string
    rating: number
    comment: string
    createdAt: string
  }>
  pendingCount: number
}

export interface WalletStats {
  totalBalance: number
  upcomingPayout: number
  pendingEarnings: number
  pendingToursCount: number
  bonusProgress?: {
    current: number
    target: number
    percentage: number
  }
  transactions: Array<{
    id: string
    date: string
    traveler: string
    tour: string
    amount: number
    status: string
  }>
}

export interface AdminStats {
  totalUsers: number
  totalTravelers: number
  totalGuides: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalRevenue: number
  newUsersLast30Days: number
  recentBookings: Array<{
    id: string
    travelerName: string
    guideName: string
    date: string
    price: number
    status: string
    createdAt: string
  }>
}

export const getGuideStats = async (guideId: string): Promise<GuideStats | null> => {
  try {
    const response = await apiClient.get(`/stats/guide/${guideId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching guide stats:', error)
    return null
  }
}

export const getAdminStats = async (): Promise<AdminStats | null> => {
  try {
    const response = await apiClient.get('/stats/admin')
    return response.data
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}

export const getWalletStats = async (guideId: string): Promise<WalletStats | null> => {
  try {
    const response = await apiClient.get(`/stats/wallet/${guideId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching wallet stats:', error)
    return null
  }
}
