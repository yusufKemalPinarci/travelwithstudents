export type Guide = {
  id: string
  userId: string // Link to User ID
  name: string
  city: string
  university: string
  rating: number
  reviews: number
  totalBookings?: number
  price: number
  bio: string
  tags?: string[]
  image?: string
  gender?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED'
  lat?: number
  lng?: number
  isPhoneVerified?: boolean
  isStudentVerified?: boolean
}

export type City = {
  id: string
  name: string
  country: string
  image?: string
}

export type Category = {
  id: string
  name: string
  image?: string
  description?: string
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export type Booking = {
  id: string
  guideId: string
  guide: Guide
  date: string
  time: string
  duration: 'Half Day' | 'Full Day'
  price: number
  status: BookingStatus
  hasReview?: boolean
  travelerAttendance?: boolean
  guideAttendance?: boolean
}

export type Message = {
  id: string
  senderId: 'me' | 'other'
  text: string
  timestamp: string
}

export type Conversation = {
  id: string
  guideId: string
  guide: Guide
  lastMessage: string
  timestamp: string
  unread: boolean
  messages: Message[]
}
