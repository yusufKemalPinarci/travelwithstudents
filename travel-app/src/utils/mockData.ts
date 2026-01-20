import type { Booking, Category, City, Conversation, Guide } from '../types'

export const guides: Guide[] = [
  {
    id: 'g1',
    name: 'Aisha Karim',
    city: 'Istanbul',
    university: 'Bogazici University',
    rating: 4.9,
    reviews: 132,
    price: 28,
    bio: 'Food-loving student guiding travelers through hidden bazaars and waterfront views.',
    tags: ['Food tours', 'History', 'Photography'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    lat: 41.0082,
    lng: 28.9784,
    isPhoneVerified: true,
  },
  {
    id: 'g2',
    name: 'Mateo Silva',
    city: 'Barcelona',
    university: 'University of Barcelona',
    rating: 4.8,
    reviews: 98,
    price: 32,
    bio: 'Architecture nerd with a love for Gaudi, beaches, and tapas crawls.',
    tags: ['Architecture', 'Nightlife'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    lat: 41.3874,
    lng: 2.1686,
  },
  {
    id: 'g3',
    name: 'Zara Singh',
    city: 'London',
    university: 'King’s College London',
    rating: 4.7,
    reviews: 76,
    price: 35,
    bio: 'Coffee shop explorer and museum buff curating cozy city walks.',
    tags: ['Museums', 'Coffee', 'Parks'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    id: 'g4',
    name: 'Luca Moretti',
    city: 'Rome',
    university: 'Sapienza University',
    rating: 4.6,
    reviews: 54,
    price: 30,
    bio: 'History student sharing ancient stories, hidden trattorias, and sunset viewpoints.',
    tags: ['History', 'Food', 'Sunsets'],
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    lat: 41.9028,
    lng: 12.4964,
  },
]

export const cities: City[] = [
  {
    id: 'c1',
    name: 'Istanbul',
    country: 'Turkey',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'c2',
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'c3',
    name: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1439416915279-68957d86ad1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'c4',
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=800&q=80',
  },
]

export const categories: Category[] = [
  { id: 'cat1', name: 'Food Tours', description: 'Street food, markets, tastings', image: cities[0].image },
  { id: 'cat2', name: 'Art & Culture', description: 'Museums, galleries, performances', image: cities[1].image },
  { id: 'cat3', name: 'Campus Life', description: 'Student hangouts and study nooks', image: cities[2].image },
  { id: 'cat4', name: 'Nature Escapes', description: 'Parks, hikes, coastal views', image: cities[3].image },
]

export const bookings: Booking[] = [
  {
    id: 'b1',
    guideId: 'g1',
    guide: guides[0],
    date: '2026-02-15',
    time: '10:00 AM',
    duration: 'Half Day',
    price: 112, // 4 hours * 28
    status: 'upcoming',
  },
  {
    id: 'b2',
    guideId: 'g2',
    guide: guides[1],
    date: '2026-01-10',
    time: '02:00 PM',
    duration: 'Full Day',
    price: 256, // 8 hours * 32
    status: 'completed',
    hasReview: false,
  },
]

export const conversations: Conversation[] = [
  {
    id: 'conv1',
    guideId: 'g1',
    guide: guides[0],
    lastMessage: "Looking forward to meeting you!",
    timestamp: '10:30 AM',
    unread: true,
    messages: [
      { id: 'm1', senderId: 'me', text: "Hi Aisha, is the food tour suitable for vegetarians?", timestamp: '10:00 AM' },
      { id: 'm2', senderId: 'other', text: "Absolutely! We visit plenty of spots with great veggie options.", timestamp: '10:15 AM' },
      { id: 'm3', senderId: 'other', text: "Looking forward to meeting you!", timestamp: '10:30 AM' },
    ],
  },
  {
    id: 'conv2',
    guideId: 'g2',
    guide: guides[1],
    lastMessage: "See you at the Sagrada Familia steps.",
    timestamp: 'Yesterday',
    unread: false,
    messages: [
      { id: 'm1', senderId: 'me', text: "Where should we meet?", timestamp: 'Yesterday' },
      { id: 'm2', senderId: 'other', text: "See you at the Sagrada Familia steps.", timestamp: 'Yesterday' },
    ],
  },
]

export const guideStats = {
  totalEarnings: 1250,
  upcomingTours: 3,
  rating: 4.9,
  profileViews: 142,
  earningsHistory: [
    { month: 'Sep', amount: 450 },
    { month: 'Oct', amount: 320 },
    { month: 'Nov', amount: 550 },
    { month: 'Dec', amount: 800 },
    { month: 'Jan', amount: 400 }, // partial
  ],
}

export const notifications = [
  { id: 'n1', title: 'New Booking Request', message: 'Sarah W. requested a Food Tour for Feb 20.', time: '2 hours ago', read: false, type: 'booking' },
  { id: 'n2', title: 'Payment Received', message: 'You received $112 for your tour with Mike.', time: '1 day ago', read: true, type: 'info' },
  { id: 'n3', title: 'New Review', message: 'Jessica left you a 5-star review!', time: '2 days ago', read: true, type: 'info' },
]

export const wishlist = [guides[1], guides[3]] // Mock wishlist items

export const guideTransactions = [
  {
    id: 't1',
    date: '2023-10-24',
    description: 'Payout for Tour #B492',
    amount: 112.00,
    status: 'completed',
    type: 'payout'
  },
  {
    id: 't2',
    date: '2023-10-20',
    description: 'Payout for Tour #B485',
    amount: 85.50,
    status: 'completed',
    type: 'payout'
  },
  {
    id: 't3',
    date: '2023-10-18',
    description: 'Pending Payout - Tour #B501',
    amount: 45.00,
    status: 'pending',
    type: 'payout'
  }
];

export const guideReviews = [
  {
    id: 'r1',
    author: 'Sarah Jenkins',
    rating: 5,
    date: '2 Days ago',
    text: "Alex was incredible! The library tour felt like stepping into a movie. Highly recommend.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFnlLluWFk7b1tmPI1SyHReuGoh5-RNFVJ7NIXrm6ojHPVOtrqFE9AFj8GovykfpMEML3WMW4wdQkwAdqn-hH0JUkMouyRq9f9UWGsffB9UJSYrIAI_nrm0pte9NwlBIOObgP97XdKB5L9scuQLavqx4oJDoXxGt2Wvj0ytdfMeLqKVmAv0vkh0tnUPyfC69n2t9WgrbWj9UpR0LrMtmKtAg4ffmpkTr3OFDjqCpVha-jxDt7bW-gDPrfDpkKNLmmanJcxH-bHJQbM'
  },
  {
    id: 'r2',
    author: 'Marcus Wei',
    rating: 4,
    date: '5 Days ago',
    text: "Great energy and very knowledgeable about the campus history. Perfect for prospective students.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZlK4AiD9K8KWy1eqP_Kk5syDvnwqMRY3BOYsWNNPY5sZzvGQw774Cc2CQR8mM_42r3O6u7-tXQEo_lsNQdQgLlaugiXZKyx6jWyORlbUd5PO55-cSvauAKKN-rhACoPs2lR6ta1o5FnXbPXauRfEYVLuaTYKyk3V3xqquZpdv7rUFXcqkytPNk-NysbCUgTuu_1NFUiRpRQ9J6TxRVKnrzYRLdAzFywU5z6F-B-M8LZ37en0hHqJYAN0W-ugyMmkKatZVyHYEEiN_'
  }
];

