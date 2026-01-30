const prisma = require('../config/prisma');

// @desc    Create a new booking request
// @route   POST /api/booking-requests
// @access  Private (Traveler only)
exports.createBookingRequest = async (req, res, next) => {
  try {
    const {
      guideId,
      bookingDate,
      bookingTime,
      duration,
      participantCount,
      message,
    } = req.body;

    // Get traveler ID from authenticated user
    const travelerId = req.user?.id;

    // Validate required fields
    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!guideId || !bookingDate || !bookingTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (guideId, bookingDate, bookingTime, duration)',
      });
    }

    // Check if guide exists and is available
    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideId },
      select: { 
        id: true, 
        isAvailable: true, 
        hourlyRate: true,
        userId: true,
        user: {
          select: {
            name: true
          }
        }
      },
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found',
      });
    }

    if (!guide.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This guide is currently unavailable',
      });
    }

    // Check for existing pending requests to same guide on same date
    const existingRequest = await prisma.bookingRequest.findFirst({
      where: {
        travelerId,
        guideId,
        bookingDate: new Date(bookingDate),
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request to this guide for this date',
      });
    }

    // Check for time conflicts with guide's bookings and tours
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    const guideTours = await prisma.tour.findMany({
      where: {
        guideId: guideId,
        tourDate: {
          gte: new Date(bookingDate),
          lt: new Date(new Date(bookingDate).setDate(new Date(bookingDate).getDate() + 1))
        },
        isActive: true
      },
      select: {
        tourTime: true,
        duration: true,
        title: true
      }
    });

    // Check for conflicts
    for (const tour of guideTours) {
      if (tour.tourTime) {
        const tourStart = new Date(`${bookingDate}T${tour.tourTime}`);
        const tourEnd = new Date(tourStart.getTime() + tour.duration * 60 * 60 * 1000);
        
        const requestDurationHours = duration === 'HALF_DAY' ? 4 : 8;
        const requestEnd = new Date(bookingDateTime.getTime() + requestDurationHours * 60 * 60 * 1000);
        
        const hasConflict = (bookingDateTime < tourEnd && requestEnd > tourStart);
        
        if (hasConflict) {
          return res.status(400).json({
            success: false,
            message: `Guide has a tour "${tour.title}" scheduled at ${tour.tourTime} on this date.`,
          });
        }
      }
    }

    // Calculate estimated price
    const hours = duration === 'HALF_DAY' ? 4 : 8;
    const basePrice = parseFloat(guide.hourlyRate) * hours;
    const platformFee = basePrice * 0.15;
    const totalPrice = basePrice + platformFee;

    // Create booking request with 72-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        travelerId,
        guideId,
        bookingDate: new Date(bookingDate),
        bookingTime,
        duration,
        participantCount: participantCount || 1,
        message,
        estimatedPrice: totalPrice,
        status: 'PENDING',
        expiresAt,
      },
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Create notification for guide
    await prisma.notification.create({
      data: {
        userId: guide.userId,
        type: 'BOOKING',
        title: 'New Booking Request',
        message: `${bookingRequest.traveler.name} sent you a booking request for ${bookingDate}`,
        actionUrl: `/guide/requests/${bookingRequest.id}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: bookingRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking requests for user
// @route   GET /api/booking-requests
// @access  Private
exports.getMyBookingRequests = async (req, res, next) => {
  try {
    const { userId, userRole } = req.query;

    if (!userId || !userRole) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required',
      });
    }

    const where = userRole === 'STUDENT_GUIDE' 
      ? { guideId: userId }
      : { travelerId: userId };

    const requests = await prisma.bookingRequest.findMany({
      where,
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or reject booking request
// @route   PUT /api/booking-requests/:id
// @access  Private (Guide only)
exports.respondToBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, guideResponse } = req.body; // action: 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "reject"',
      });
    }

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
          },
        },
        guide: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been responded to',
      });
    }

    // Check if expired
    if (new Date() > new Date(request.expiresAt)) {
      await prisma.bookingRequest.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });

      return res.status(400).json({
        success: false,
        message: 'This request has expired',
      });
    }

    const updateData = {
      status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      guideResponse,
      respondedAt: new Date(),
    };

    // If accepting, set payment deadline (24 hours)
    if (action === 'accept') {
      const paymentDeadline = new Date();
      paymentDeadline.setHours(paymentDeadline.getHours() + 24);
      updateData.paymentDeadline = paymentDeadline;
    }

    const updatedRequest = await prisma.bookingRequest.update({
      where: { id },
      data: updateData,
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Create notification for traveler
    const notificationMessage = action === 'accept'
      ? `Your booking request has been accepted! Please complete payment within 24 hours.`
      : `Your booking request has been declined.`;

    await prisma.notification.create({
      data: {
        userId: request.traveler.id,
        type: 'BOOKING',
        title: action === 'accept' ? 'Request Accepted!' : 'Request Declined',
        message: notificationMessage,
        actionUrl: action === 'accept' ? `/requests/${id}/payment` : `/requests/${id}`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Booking request ${action}ed successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete payment for accepted request
// @route   POST /api/booking-requests/:id/payment
// @access  Private (Traveler only)
exports.completeRequestPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        guide: {
          select: {
            userId: true,
            hourlyRate: true,
          },
        },
        traveler: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    if (request.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'This request is not in accepted status',
      });
    }

    // Check if payment deadline passed
    if (new Date() > new Date(request.paymentDeadline)) {
      await prisma.bookingRequest.update({
        where: { id },
        data: { status: 'PAYMENT_EXPIRED' },
      });

      return res.status(400).json({
        success: false,
        message: 'Payment deadline has passed',
      });
    }

    // Calculate pricing
    const hours = request.duration === 'HALF_DAY' ? 4 : 8;
    const basePrice = parseFloat(request.guide.hourlyRate) * hours;
    const platformFee = basePrice * 0.15;
    const totalPrice = basePrice + platformFee;
    const guideEarnings = basePrice * 0.85;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        travelerId: request.travelerId,
        guideId: request.guideId,
        bookingDate: request.bookingDate,
        bookingTime: request.bookingTime,
        duration: request.duration,
        participantCount: request.participantCount,
        totalPrice,
        platformFee,
        guideEarnings,
        status: 'CONFIRMED',
        notes: request.message,
        requestId: request.id,
        guideAttendance: 'PENDING',
        travelerAttendance: 'PENDING',
      },
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: request.travelerId,
        bookingId: booking.id,
        guideId: request.guideId,
        type: 'BOOKING_PAYMENT',
        amount: totalPrice,
        currency: 'USD',
        status: 'HELD', // Escrow
        description: `Booking payment for ${request.bookingDate}`,
        paymentMethod: paymentMethod || 'CARD',
      },
    });

    // Update request status
    await prisma.bookingRequest.update({
      where: { id },
      data: { status: 'PAID' },
    });

    // Notify guide
    await prisma.notification.create({
      data: {
        userId: request.guide.userId,
        type: 'BOOKING',
        title: 'Booking Confirmed!',
        message: `${request.traveler.name} completed payment. Booking confirmed for ${request.bookingDate}`,
        actionUrl: `/guide/bookings/${booking.id}`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        booking,
        request,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking request
// @route   DELETE /api/booking-requests/:id
// @access  Private
exports.cancelBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    if (!['PENDING', 'ACCEPTED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this request',
      });
    }

    await prisma.bookingRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({
      success: true,
      message: 'Booking request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-expire old requests (Cron job)
// @route   POST /api/booking-requests/expire
// @access  Internal
exports.expireOldRequests = async (req, res, next) => {
  try {
    const now = new Date();

    // Expire pending requests that passed expiresAt
    await prisma.bookingRequest.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Expire accepted requests that passed paymentDeadline
    await prisma.bookingRequest.updateMany({
      where: {
        status: 'ACCEPTED',
        paymentDeadline: {
          lt: now,
        },
      },
      data: {
        status: 'PAYMENT_EXPIRED',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Expired requests updated',
    });
  } catch (error) {
    next(error);
  }
};
