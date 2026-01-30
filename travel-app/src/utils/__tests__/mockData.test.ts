import { describe, it, expect } from 'vitest'
import { guides, cities, categories, bookings, conversations, adminUsers } from '../mockData'

describe('mockData', () => {
  describe('guides', () => {
    it('should have guide data', () => {
      expect(guides).toBeDefined()
      expect(guides.length).toBeGreaterThan(0)
    })

    it('all guides should have required properties', () => {
      guides.forEach((guide) => {
        expect(guide).toHaveProperty('id')
        expect(guide).toHaveProperty('name')
        expect(guide).toHaveProperty('city')
        expect(guide).toHaveProperty('university')
        expect(guide).toHaveProperty('rating')
        expect(guide).toHaveProperty('reviews')
        expect(guide).toHaveProperty('price')
        expect(guide).toHaveProperty('bio')
        expect(guide).toHaveProperty('image')
      })
    })

    it('guide ratings should be between 0 and 5', () => {
      guides.forEach((guide) => {
        expect(guide.rating).toBeGreaterThanOrEqual(0)
        expect(guide.rating).toBeLessThanOrEqual(5)
      })
    })

    it('guide prices should be positive numbers', () => {
      guides.forEach((guide) => {
        expect(guide.price).toBeGreaterThan(0)
      })
    })

    it('guide ids should be unique', () => {
      const ids = guides.map((g) => g.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('cities', () => {
    it('should have city data', () => {
      expect(cities).toBeDefined()
      expect(cities.length).toBeGreaterThan(0)
    })

    it('all cities should have required properties', () => {
      cities.forEach((city) => {
        expect(city).toHaveProperty('id')
        expect(city).toHaveProperty('name')
        expect(city).toHaveProperty('country')
        expect(city).toHaveProperty('image')
      })
    })

    it('city ids should be unique', () => {
      const ids = cities.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('categories', () => {
    it('should have category data', () => {
      expect(categories).toBeDefined()
      expect(categories.length).toBeGreaterThan(0)
    })

    it('all categories should have required properties', () => {
      categories.forEach((category) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('image')
      })
    })
  })

  describe('bookings', () => {
    it('should have booking data', () => {
      expect(bookings).toBeDefined()
      expect(bookings.length).toBeGreaterThan(0)
    })

    it('all bookings should have required properties', () => {
      bookings.forEach((booking) => {
        expect(booking).toHaveProperty('id')
        expect(booking).toHaveProperty('guide')
        expect(booking).toHaveProperty('date')
        expect(booking).toHaveProperty('time')
        expect(booking).toHaveProperty('duration')
        expect(booking).toHaveProperty('price')
        expect(booking).toHaveProperty('status')
      })
    })

    it('booking status should be valid', () => {
      const validStatuses = ['upcoming', 'completed', 'cancelled']
      bookings.forEach((booking) => {
        expect(validStatuses).toContain(booking.status)
      })
    })

    it('booking prices should be positive', () => {
      bookings.forEach((booking) => {
        expect(booking.price).toBeGreaterThan(0)
      })
    })
  })

  describe('conversations', () => {
    it('should have conversation data', () => {
      expect(conversations).toBeDefined()
      expect(conversations.length).toBeGreaterThan(0)
    })

    it('all conversations should have required properties', () => {
      conversations.forEach((conversation) => {
        expect(conversation).toHaveProperty('id')
        expect(conversation).toHaveProperty('guideId')
        expect(conversation).toHaveProperty('guide')
        expect(conversation).toHaveProperty('lastMessage')
        expect(conversation).toHaveProperty('timestamp')
        expect(conversation).toHaveProperty('unread')
      })
    })

    it('unread should be boolean', () => {
      conversations.forEach((conversation) => {
        expect(typeof conversation.unread).toBe('boolean')
      })
    })
  })

  describe('adminUsers', () => {
    it('should have admin user data', () => {
      expect(adminUsers).toBeDefined()
      expect(adminUsers.length).toBeGreaterThan(0)
    })

    it('all admin users should have required properties', () => {
      adminUsers.forEach((user) => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('status')
        expect(user).toHaveProperty('joinDate')
      })
    })

    it('user roles should be valid', () => {
      const validRoles = ['Traveler', 'Student Guide']
      adminUsers.forEach((user) => {
        expect(validRoles).toContain(user.role)
      })
    })

    it('user status should be valid', () => {
      const validStatuses = ['active', 'inactive', 'suspended']
      adminUsers.forEach((user) => {
        expect(validStatuses).toContain(user.status)
      })
    })

    it('user emails should be valid format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      adminUsers.forEach((user) => {
        expect(user.email).toMatch(emailRegex)
      })
    })
  })
})
