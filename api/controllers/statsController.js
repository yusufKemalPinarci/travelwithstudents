const prisma = require('../config/prisma')

// Guide istatistiklerini getir
const getGuideStats = async (req, res) => {
  try {
    const { guideId } = req.params

    // Guide profilini çek
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId: guideId },
      include: {
        user: true
      }
    })

    if (!guideProfile) {
      return res.status(404).json({ error: 'Guide profile not found' })
    }

    const realGuideId = guideProfile.id;

    // Bookings istatistikleri
    const allBookings = await prisma.booking.findMany({
      where: { guideId: realGuideId },
      include: {
        traveler: true
      }
    })

    const completedBookings = allBookings.filter(b => b.status === 'COMPLETED')
    const completionRate = allBookings.length > 0 
      ? ((completedBookings.length / allBookings.length) * 100).toFixed(0)
      : 0

    // Son 6 aylık kazanç geçmişi
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const earningsHistory = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        guideId: realGuideId,
        status: 'COMPLETED',
        bookingDate: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        guideEarnings: true
      },
      orderBy: {
        bookingDate: 'asc'
      }
    })

    // Aylık toplam kazançları hesapla
    const monthlyEarnings = {}
    earningsHistory.forEach(record => {
      const month = new Date(record.bookingDate).toLocaleDateString('en-US', { month: 'short' })
      if (!monthlyEarnings[month]) {
        monthlyEarnings[month] = 0
      }
      monthlyEarnings[month] += record._sum.guideEarnings || 0
    })

    const earningsHistoryArray = Object.entries(monthlyEarnings).map(([month, amount]) => ({
      month,
      amount: Math.round(amount)
    }))

    // Son bookinglar (upcoming veya pending)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        guideId: realGuideId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        traveler: true
      },
      orderBy: {
        bookingDate: 'asc'
      },
      take: 5
    })

    // Son tamamlanan turlar (Earnings Page için)
    const recentTransactions = await prisma.booking.findMany({
      where: {
        guideId: realGuideId,
        status: 'COMPLETED'
      },
      include: {
        traveler: true
      },
      orderBy: {
        bookingDate: 'desc'
      },
      take: 5
    })

    // Son reviews
    const recentReviews = await prisma.review.findMany({
      where: { guideId: realGuideId },
      include: {
        traveler: {
          select: { name: true, profileImage: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // --- XP & Level Calculation ---
    // 1. Calculate XP from Bookings (50 XP per completed tour)
    const bookingXp = completedBookings.length * 50;

    // 2. Calculate XP from Reviews (Rating * 10 XP)
    const reviewStats = await prisma.review.aggregate({
      where: { guideId: realGuideId },
      _sum: { rating: true }
    });
    const reviewXp = (reviewStats._sum.rating || 0) * 10;
    
    const totalXp = bookingXp + reviewXp;

    // 3. Determine Level
    let level = 1;
    let levelTitle = "Newbie";
    let nextLevelXp = 200;
    
    if (totalXp >= 2500) {
       level = 5; levelTitle = "Legend"; nextLevelXp = 5000;
    } else if (totalXp >= 1000) {
       level = 4; levelTitle = "Guide Master"; nextLevelXp = 2500;
    } else if (totalXp >= 500) {
       level = 3; levelTitle = "Local Expert"; nextLevelXp = 1000;
    } else if (totalXp >= 200) {
       level = 2; levelTitle = "Rising Star"; nextLevelXp = 500;
    }

    // --- Bonus Progress Calculation ---
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count COMPLETED bookings from this month only
    const monthlyCompletedBookings = await prisma.booking.count({
      where: {
        guideId: realGuideId,
        status: 'COMPLETED',
        bookingDate: {
          gte: firstDayOfMonth
        }
      }
    });

    const BONUS_TARGET = 10;
    const bonusProgress = {
      current: monthlyCompletedBookings,
      target: BONUS_TARGET,
      percentage: Math.min((monthlyCompletedBookings / BONUS_TARGET) * 100, 100)
    };

    const stats = {
      level,
      levelTitle,
      currentXp: totalXp,
      nextLevelXp,
      bonusProgress, // New bonus data
      isAvailable: guideProfile.isAvailable,
      totalEarnings: guideProfile.totalEarnings ? Number(guideProfile.totalEarnings) : 0,
      profileViews: guideProfile.profileViews || 0,
      rating: guideProfile.averageRating ? Number(guideProfile.averageRating) : 0,
      totalReviews: guideProfile.totalReviews || 0,
      completionRate: `${completionRate}%`,
      totalBookings: guideProfile.totalBookings || 0,
      earningsHistory: earningsHistoryArray,
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        travelerName: booking.traveler.name,
        travelerImage: booking.traveler.profileImage,
        tourName: booking.notes || "Private Student Tour",
        date: booking.bookingDate,
        time: booking.bookingTime,
        duration: booking.duration,
        guests: booking.participantCount,
        price: booking.totalPrice,
        status: booking.status
      })),
      recentTransactions: recentTransactions.map(booking => ({
         id: booking.id,
         tourName: "Tour Payment", // Booking modelinde tourName yok, generic isim verelim
         date: booking.bookingDate,
         amount: booking.guideEarnings,
         status: booking.status
      })),
      recentReviews: recentReviews.map(review => ({
        id: review.id,
        travelerName: review.traveler.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      })),
      pendingCount: upcomingBookings.filter(b => b.status === 'PENDING').length
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching guide stats:', error)
    res.status(500).json({ error: 'Failed to fetch guide statistics' })
  }
}

// Admin dashboard istatistikleri
const getAdminStats = async (req, res) => {
  try {
    // Toplam kullanıcılar
    const totalUsers = await prisma.user.count()
    const totalTravelers = await prisma.user.count({
      where: { role: 'TRAVELER' }
    })
    const totalGuides = await prisma.user.count({
      where: { role: 'STUDENT_GUIDE' }
    })

    // Toplam bookings
    const totalBookings = await prisma.booking.count()
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' }
    })
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' }
    })

    // Toplam kazanç
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        platformFee: true
      }
    })

    // Son 30 günlük yeni kullanıcılar
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Son aktiviteler
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        traveler: true,
        guide: {
          include: {
            user: true
          }
        }
      }
    })

    res.json({
      totalUsers,
      totalTravelers,
      totalGuides,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.platformFee || 0,
      newUsersLast30Days: newUsers,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        travelerName: b.traveler.name,
        guideName: b.guide?.user?.name || 'Unknown',
        date: b.bookingDate,
        price: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: 'Failed to fetch admin statistics' })
  }
}

// Guide wallet stats
const getWalletStats = async (req, res) => {
  try {
    const { guideId } = req.params

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId: guideId }
    })

    if (!guideProfile) {
      return res.status(404).json({ error: 'Guide profile not found' })
    }

    const realGuideId = guideProfile.id

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: { guideId: realGuideId },
      include: {
        traveler: {
          select: { name: true }
        }
      },
      orderBy: { bookingDate: 'desc' }
    })

    // Calculate Earnings
    const pendingEarnings = bookings
      .filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
      .reduce((acc, b) => acc + Number(b.guideEarnings), 0)

    const completedEarnings = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((acc, b) => acc + Number(b.guideEarnings), 0)

    // Get Payouts
    const payouts = await prisma.transaction.findMany({
      where: {
        userId: guideId,
        type: 'PAYOUT'
      },
      orderBy: { createdAt: 'desc' }
    })

    const completedPayouts = payouts
      .filter(p => p.status === 'COMPLETED' || p.status === 'PROCESSING')
      .reduce((acc, p) => acc + Number(p.amount), 0)

    const upcomingPayout = payouts
      .filter(p => p.status === 'PENDING')
      .reduce((acc, p) => acc + Number(p.amount), 0)

    // Helper for transactions
    const bookingTrans = bookings
      .filter(b => b.status === 'COMPLETED')
      .map(b => ({
        id: `TRX-${b.id.substring(0, 6)}`,
        date: b.bookingDate,
        traveler: b.traveler.name,
        tour: 'Tour Earnings',
        amount: Number(b.guideEarnings),
        status: 'completed',
        rawDate: b.bookingDate
      }))

    const payoutTrans = payouts.map(p => ({
      id: `PAY-${p.id.substring(0, 6)}`,
      date: p.createdAt,
      traveler: '-',
      tour: 'Payout Withdrawal',
      amount: -Number(p.amount),
      status: p.status.toLowerCase(),
      rawDate: p.createdAt
    }))

    const transactions = [...bookingTrans, ...payoutTrans]
      .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
      .map(({ rawDate, ...rest }) => ({
        ...rest,
        date: new Date(rawDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }))

    // --- Bonus Progress Calculation ---
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyCompletedBookings = await prisma.booking.count({
      where: {
        guideId: realGuideId,
        status: 'COMPLETED',
        bookingDate: {
          gte: firstDayOfMonth
        }
      }
    });

    const BONUS_TARGET = 10;
    const bonusProgress = {
      current: monthlyCompletedBookings,
      target: BONUS_TARGET,
      percentage: Math.min((monthlyCompletedBookings / BONUS_TARGET) * 100, 100)
    };

    res.json({
      totalBalance: Math.max(0, completedEarnings - completedPayouts),
      upcomingPayout,
      pendingEarnings,
      pendingToursCount: bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status)).length,
      transactions,
      bonusProgress
    })

  } catch (error) {
    console.error('Error fetching wallet stats:', error)
    res.status(500).json({ error: 'Failed to fetch wallet statistics' })
  }
}

module.exports = {
  getGuideStats,
  getAdminStats,
  getWalletStats
}
