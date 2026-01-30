const prisma = require('../config/prisma')

// Tüm kullanıcıları listele
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query

    const where = {}
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        guideProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

// Kullanıcı durumunu güncelle
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status }
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
}

// Kullanıcıyı sil
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    await prisma.user.delete({
      where: { id: userId }
    })

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

// Tüm transaction'ları listele
const getAllTransactions = async (req, res) => {
  try {
    const { status, guideId } = req.query

    const where = {}
    
    if (status) {
      where.status = status
    }
    
    if (guideId) {
      where.guideId = guideId
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        traveler: true,
        guide: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transactions = bookings.map(b => ({
      id: b.id,
      travelerId: b.travelerId,
      travelerName: b.traveler.name,
      travelerEmail: b.traveler.email,
      guideId: b.guideId,
      guideName: b.guide?.user?.name || 'Unknown',
      date: b.bookingDate,
      totalAmount: b.totalPrice,
      platformFee: b.platformFee,
      guideEarnings: b.guideEarnings,
      status: b.status,
      createdAt: b.createdAt
    }))

    res.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
}

// Tüm review'ları listele (moderasyon için)
const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query

    const where = {}
    
    // Eğer status filtresi varsa ekle (örn: flagged reviews)
    // Şimdilik tüm reviews

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: true,
        guide: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
}

// Review sil (moderasyon)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params

    await prisma.review.delete({
      where: { id: reviewId }
    })

    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

// Booking management
// Get specialized dispute evidence for "Truth Finding" with System Recommendation
const getDisputeEvidence = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        traveler: { include: { user: true } },
        guide: { include: { user: true } },
        transaction: true
      }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // 1. Chat History Analysis (Messages within 24h of booking)
    const bookingDateStart = new Date(booking.bookingDate);
    bookingDateStart.setHours(0,0,0,0);
    const bookingDateEnd = new Date(booking.bookingDate);
    bookingDateEnd.setDate(bookingDateEnd.getDate() + 1);

    const relatedMessages = await prisma.message.findMany({
      where: {
         conversation: {
            participants: {
               every: {
                  userId: { in: [booking.traveler.userId, booking.guide.userId] }
               }
            }
         }
      },
      orderBy: { createdAt: 'asc' },
      take: 50 // Last 50 messages
    });

    // 2. Reputation/History Check
    const travelerStats = await prisma.booking.groupBy({
       by: ['status'],
       where: { travelerId: booking.travelerId },
       _count: { status: true }
    });

    const guideStats = await prisma.booking.groupBy({
       by: ['status'],
       where: { guideId: booking.guideId },
       _count: { status: true }
    });
    
    // Helper to extract counts
    const getCount = (stats, status) => stats.find(s => s.status === status)?._count.status || 0;
    
    // 3. System Analysis Algorithm
    let score = 0; // Negative = Traveler Favor, Positive = Guide Favor
    let reasons = [];

    // Analyze Guide
    const guideCompleted = getCount(guideStats, 'COMPLETED');
    const guideDisputes = getCount(guideStats, 'DISPUTED') + getCount(guideStats, 'NO_SHOW_GUIDE');
    
    if (guideCompleted > 10 && guideDisputes === 0) {
       score += 5;
       reasons.push('High Reputation Guide (10+ flawless tours)');
    } else if (guideCompleted > 5) {
       score += 2;
    }

    if (guideDisputes > 2) {
       score -= 5;
       reasons.push('Guide has history of disputes');
    }

    // Analyze Traveler
    const travelerCompleted = getCount(travelerStats, 'COMPLETED');
    const travelerDisputes = getCount(travelerStats, 'DISPUTED') + getCount(travelerStats, 'NO_SHOW_TRAVELER');

    if (travelerCompleted === 0) {
       score += 1; // Slight bias to guide for new accounts vs established guide
       reasons.push('New Traveler Account');
    }

    if (travelerDisputes > 1) {
       score += 4; // Bias against traveler
       reasons.push('Traveler has history of disputes');
    }

    // Analyze Chat Activity (Simple Heuristic: If they chatted on the day, probability of meeting is higher, favours guide claim of "Attended")
    const chatOnDay = relatedMessages.some(m => {
       const mDate = new Date(m.createdAt);
       return mDate >= bookingDateStart && mDate <= bookingDateEnd;
    });

    if (chatOnDay) {
       score += 2;
       reasons.push('Communication detected on tour day');
    }

    let recommendation = 'MANUAL_REVIEW';
    if (score >= 4) recommendation = 'FAVOR_GUIDE';
    if (score <= -4) recommendation = 'FAVOR_TRAVELER';

    const systemAnalysis = {
       recommendation,
       confidenceScore: score, // Range approx -10 to 10
       reasoning: reasons
    };
    
    const analysis = {
       travelerReliability: {
          totalBookings: travelerStats.reduce((acc, curr) => acc + curr._count.status, 0),
          disputes: getCount(travelerStats, 'DISPUTED'),
          noShows: getCount(travelerStats, 'NO_SHOW_TRAVELER') + getCount(travelerStats, 'NO_SHOW_BOTH')
       },
       guideReliability: {
          totalBookings: guideStats.reduce((acc, curr) => acc + curr._count.status, 0),
          disputes: getCount(guideStats, 'DISPUTED'),
          noShows: getCount(guideStats, 'NO_SHOW_GUIDE') + getCount(guideStats, 'NO_SHOW_BOTH')
       },
       attendanceClaims: {
          travelerClaim: booking.travelerAttendance, // 'CONFIRMED' or 'NO_SHOW'
          travelerClaimTime: booking.travelerConfirmedAt,
          guideClaim: booking.guideAttendance,     // 'CONFIRMED' or 'NO_SHOW'
          guideClaimTime: booking.guideConfirmedAt
       }
    };

    res.json({
       booking, 
       evidence: {
          messages: relatedMessages,
          analysis,
          systemAnalysis
       }
    });

  } catch (error) {
    console.error('Error fetching dispute evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
};

// Initiate specific dispute chat
const initiateDisputeChat = async (req, res) => {
   try {
      const { bookingId } = req.params;
      const { targetUserId } = req.body; // The user Admin wants to talk to
      const adminId = req.user.id; // Admin User ID

      // Verify booking context
      const booking = await prisma.booking.findUnique({
         where: { id: bookingId }
      });
      
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      
      // Ensure target is part of booking
      if (booking.travelerId !== targetUserId && booking.guideId !== targetUserId && booking.guide.userId !== targetUserId && booking.traveler.userId !== targetUserId) {
          // Note: booking.travelerId refers to profile ID or user ID depending on schema. 
          // Schema says booking.travelerId -> User.id via relation?
          // Let's check Schema: booking.travelerId references User(id). Correct.
          // booking.guideId references GuideProfile(id). We need guide.userId.
          
          // Re-fetch to be safe about IDs
          const detailedBooking = await prisma.booking.findUnique({
              where: { id: bookingId }, 
              include: { guide: true }
          });
          
          if (targetUserId !== detailedBooking.travelerId && targetUserId !== detailedBooking.guide.userId) {
              return res.status(400).json({ error: 'Target user is not part of this booking' });
          }
      }

      // Create/Get Conversation
      // Check existing
      const existing = await prisma.conversation.findFirst({
         where: {
            AND: [
               { participants: { some: { userId: adminId } } },
               { participants: { some: { userId: targetUserId } } }
            ]
         }
      });

      if (existing) {
         return res.json({ conversationId: existing.id });
      }

      // Create New
      const conversation = await prisma.conversation.create({
         data: {
            participants: {
               create: [
                  { userId: adminId },
                  { userId: targetUserId }
               ]
            }
         }
      });
      
      // Send initial System Message
      await prisma.message.create({
         data: {
            conversationId: conversation.id,
            senderId: adminId,
            content: `Hello, this is regarding Dispute for Booking #${bookingId.slice(0,8)}. Can you please provide your details?`,
            bookingId: bookingId
         }
      });

      res.json({ conversationId: conversation.id });

   } catch (error) {
      console.error('Error init dispute chat:', error);
      res.status(500).json({ error: 'Failed to initiate chat' });
   }
};

// Resolve Dispute (Admin Action)
const resolveDispute = async (req, res) => {
   try {
     const { bookingId } = req.params;
     const { resolution, adminNote } = req.body; // resolution: 'REFUND_TRAVELER' | 'PAY_GUIDE'
     
     if (!['REFUND_TRAVELER', 'PAY_GUIDE'].includes(resolution)) {
        return res.status(400).json({ error: 'Invalid resolution type' });
     }

     const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { transaction: true, guide: { include: { user: true } }, traveler: { include: { user: true } } }
     });

     if (!booking) return res.status(404).json({ error: 'Booking not found' });

     let updateData = {};
     let transactionUpdate = {};
     let newStatus = '';
     let notificationUser = '';
     let notificationMsg = '';

     if (resolution === 'REFUND_TRAVELER') {
        newStatus = 'REFUNDED';
        updateData = { status: 'REFUNDED', cancellationReason: `Admin Resolution: ${adminNote}` };
        transactionUpdate = { status: 'REFUNDED', escrowStatus: 'REFUNDED' };
        notificationUser = booking.traveler.userId;
        notificationMsg = 'Dispute resolved in your favor. Refund initiated.';
     } else {
        newStatus = 'COMPLETED';
        updateData = { status: 'COMPLETED', completedAt: new Date() };
        transactionUpdate = { status: 'COMPLETED', escrowStatus: 'RELEASED' };
        notificationUser = booking.guide.userId;
        notificationMsg = 'Dispute resolved in your favor. Payment released.';
        
        // Add earnings to guide
        await prisma.guideProfile.update({
           where: { id: booking.guideId },
           data: {
              totalEarnings: { increment: booking.guideEarnings },
              totalBookings: { increment: 1 }
           }
        });
     }

     // Execute Transaction
     await prisma.$transaction([
        prisma.booking.update({ where: { id: bookingId }, data: updateData }),
        prisma.transaction.update({ where: { id: booking.transaction.id }, data: transactionUpdate }),
        prisma.notification.create({
           data: {
              userId: notificationUser,
              type: 'BOOKING',
              title: 'Dispute Resolved',
              message: notificationMsg,
              actionUrl: `/bookings/${bookingId}`
           }
        })
     ]);

     res.json({ success: true, message: `Dispute resolved: ${newStatus}` });

   } catch (error) {
      console.error('Error resolving dispute:', error);
      res.status(500).json({ error: 'Failed to resolve dispute' });
   }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, guideId, travelerId } = req.query

    const where = {}
    
    if (status) {
      where.status = status
    }
    
    if (guideId) {
      where.guideId = guideId
    }
    
    if (travelerId) {
      where.travelerId = travelerId
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        traveler: true,
        guide: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

// Booking durumunu güncelle
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { status } = req.body

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    })

    res.json(booking)
  } catch (error) {
    console.error('Error updating booking status:', error)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
}

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTransactions,
  getAllReviews,
  deleteReview,
  getAllBookings,
  updateBookingStatus,
  getDisputeEvidence,
  resolveDispute,
  initiateDisputeChat
}
