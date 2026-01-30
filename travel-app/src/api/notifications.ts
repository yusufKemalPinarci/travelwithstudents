import apiClient from './client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    // Backend expects GET /notifications (userId is extracted from token)
    const response = await apiClient.get('/notifications')
    return response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export const markAsRead = async (notificationId: string): Promise<Notification | null> => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return null
  }
}

export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${userId}/read-all`)
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<Notification | null> => {
  try {
    const response = await apiClient.post('/notifications', {
      userId,
      type,
      title,
      message
    })
    return response.data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}
