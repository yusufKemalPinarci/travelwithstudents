const prisma = require('../config/prisma');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Traveler only)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      travelerId,
      guideId,
      tourId,
      bookingDate,
      bookingTime,
      duration,
      participantCount,
      notes,
    } = req.body;

    // Validate required fields
    if (!travelerId || !guideId || !bookingDate || !bookingTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const participants = participantCount || 1;

    // Check if guide has a tour at the requested time
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    // Get all tours for this guide on the same date
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
        id: true,
        tourTime: true,
        duration: true,
        title: true
      }
    });

    // Check for time conflicts with existing tours
    for (const tour of guideTours) {
      if (tour.tourTime) {
        const tourStart = new Date(`${bookingDate}T${tour.tourTime}`);
        const tourEnd = new Date(tourStart.getTime() + tour.duration * 60 * 60 * 1000);
        
        // Calculate booking end time based on duration type
        let bookingDurationHours = 0;
        if (tourId) {
          // For tour bookings, get the tour duration
          const requestedTour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { duration: true }
          });
          bookingDurationHours = requestedTour?.duration || 2;
        } else {
          // For regular bookings
          bookingDurationHours = duration === 'HALF_DAY' ? 4 : 8;
        }
        
        const bookingEnd = new Date(bookingDateTime.getTime() + bookingDurationHours * 60 * 60 * 1000);
        
        // Check if times overlap
        const hasConflict = (bookingDateTime < tourEnd && bookingEnd > tourStart);
        
        if (hasConflict) {
          return res.status(400).json({
            success: false,
            message: `Guide is not available at this time. They have a tour "${tour.title}" scheduled at ${tour.tourTime}.`,
          });
        }
      }
    }

    // If booking a tour, check availability
    if (tourId) {
      const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        select: { 
          id: true,
          availableSlots: true, 
          price: true, 
          maxParticipants: true,
          title: true,
          description: true,
          category: true,
          location: true,
          duration: true,
          language: true,
          photos: true
        }
      });

      if (!tour) {
        return res.status(404).json({
          success: false,
          message: 'Tour not found'
        });
      }

      if (tour.availableSlots < participants) {
        return res.status(400).json({
          success: false,
          message: `Only ${tour.availableSlots} slots available`
        });
      }

      // Calculate pricing for tour
      const basePrice = parseFloat(tour.price) * participants;
      const platformFee = basePrice * 0.10; // 10% platform fee for tours
      const totalPrice = basePrice + platformFee;
      const guideEarnings = basePrice * 0.90;

      // Create tour snapshot for booking
      const tourSnapshot = {
        title: tour.title,
        description: tour.description,
        category: tour.category,
        location: tour.location,
        duration: tour.duration,
        price: parseFloat(tour.price),
        language: tour.language,
        photos: tour.photos
      };

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          travelerId,
          guideId,
          tourId,
          bookingDate: new Date(bookingDate),
          bookingTime,
          duration,
          participantCount: participants,
          totalPrice,
          platformFee,
          guideEarnings,
          status: 'PENDING',
          notes,
          tourSnapshot: tourSnapshot,
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
          tour: true,
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

      // Reduce available slots
      await prisma.tour.update({
        where: { id: tourId },
        data: {
          availableSlots: {
            decrement: participants
          }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: travelerId,
          bookingId: booking.id,
          guideId,
          type: 'BOOKING_PAYMENT',
          amount: totalPrice,
          currency: 'USD',
          status: 'PENDING',
          description: `Tour booking payment for ${participants} participant(s)`,
        },
      });

      // Create notification for guide (tour booking)
      await prisma.notification.create({
        data: {
          userId: booking.guide.userId,
          type: 'BOOKING',
          title: 'New Tour Booking',
          message: `${booking.traveler.name} booked your tour for ${participants} participant(s) on ${bookingDate}`,
          actionUrl: `/guide/bookings/${booking.id}`,
        },
      });

      return res.status(201).json({
        success: true,
        data: booking,
      });
    }

    // Regular guide booking (non-tour)
    // Get guide profile to calculate price
    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideId },
      select: { hourlyRate: true, isAvailable: true, userId: true },
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

    // Calculate pricing
    const hours = duration === 'HALF_DAY' ? 4 : 8;
    const basePrice = parseFloat(guide.hourlyRate) * hours;
    const platformFee = basePrice * 0.15; // 15% platform fee
    const totalPrice = basePrice + platformFee;
    const guideEarnings = basePrice * 0.85; // Guide gets 85%

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        travelerId,
        guideId,
        bookingDate: new Date(bookingDate),
        bookingTime,
        duration,
        participantCount: 1,
        totalPrice,
        platformFee,
        guideEarnings,
        status: 'PENDING',
        notes,
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
        userId: travelerId,
        bookingId: booking.id,
        guideId,
        type: 'BOOKING_PAYMENT',
        amount: totalPrice,
        currency: 'USD',
        status: 'PENDING',
        description: `Booking payment for tour on ${bookingDate}`,
      },
    });

    // Create notification for guide
    await prisma.notification.create({
      data: {
        userId: guide.userId,
        type: 'BOOKING',
        title: 'New Booking Request',
        message: `${booking.traveler.name} requested a ${duration.toLowerCase().replace('_', ' ')} tour on ${bookingDate}`,
        actionUrl: `/guide/bookings/${booking.id}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required',
      });
    }

    let bookings;

    if (role === 'TRAVELER') {
      // Get bookings as traveler (only confirmed/paid bookings, not pending requests)
      bookings = await prisma.booking.findMany({
        where: { 
          travelerId: userId,
          status: {
            in: ['CONFIRMED', 'COMPLETED', 'CANCELLED']
          }
        },
        include: {
          guide: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          tour: {
            select: {
              id: true,
              title: true,
              photos: true,
              category: true,
            },
          },
          review: true,
        },
        orderBy: { bookingDate: 'desc' },
      });
    } else if (role === 'STUDENT_GUIDE') {
      // Get guide profile first
      const guideProfile = await prisma.guideProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!guideProfile) {
        return res.status(404).json({
          success: false,
          message: 'Guide profile not found',
        });
      }

      // Get bookings as guide
      bookings = await prisma.booking.findMany({
        where: { 
          guideId: guideProfile.id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
          }
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
          tour: {
            select: {
              id: true,
              title: true,
              photos: true,
              category: true,
            },
          },
          review: true,
        },
        orderBy: { bookingDate: 'desc' },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Transform data to match frontend format
    const transformedBookings = bookings.map(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Determine status based on date and current status
      let mappedStatus = booking.status.toLowerCase();
      if (mappedStatus === 'confirmed') {
        if (bookingDate < today) {
          mappedStatus = 'completed'; // Past bookings are completed
        } else {
          mappedStatus = 'upcoming'; // Future bookings are upcoming
        }
      } else if (mappedStatus === 'completed') {
        mappedStatus = 'completed';
      } else if (mappedStatus === 'cancelled') {
        mappedStatus = 'cancelled';
      }
      
      return {
      id: booking.id,
      date: booking.bookingDate.toISOString().split('T')[0],
      time: booking.bookingTime,
      duration: booking.duration === 'HALF_DAY' ? 'Half Day' : 'Full Day',
      price: parseFloat(booking.totalPrice),
      status: mappedStatus,
      notes: booking.notes,
      hasReview: !!booking.review,
      travelerAttendance: booking.travelerAttendance || false,
      guideAttendance: booking.guideAttendance || false,
      // Use snapshot if available, otherwise use current tour data
      ...(booking.tourSnapshot ? {
        tour: booking.tourSnapshot,
      } : booking.tour ? {
        tour: {
          id: booking.tour.id,
          title: booking.tour.title,
          photos: booking.tour.photos,
          category: booking.tour.category,
        },
      } : {}),
      ...(role === 'TRAVELER' ? {
        guide: {
          id: booking.guide.id,
          name: booking.guide.user.name,
          image: booking.guide.user.profileImage,
          city: booking.guide.city,
          university: booking.guide.university,
          rating: parseFloat(booking.guide.averageRating),
          reviews: booking.guide.totalReviews,
          price: parseFloat(booking.guide.hourlyRate),
        },
      } : {
        traveler: {
          id: booking.traveler.id,
          name: booking.traveler.name,
          email: booking.traveler.email,
          image: booking.traveler.profileImage,
        },
      }),
    };
    });

    res.status(200).json({
      success: true,
      count: transformedBookings.length,
      data: transformedBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
        review: true,
        transaction: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason, cancelledBy } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updateData = {
      status,
      ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(status === 'COMPLETED' && { completedAt: new Date() }),
      ...(status === 'CANCELLED' && {
        cancelledAt: new Date(),
        cancellationReason,
        cancelledBy,
      }),
    };

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
          },
        },
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update guide statistics if completed
    if (status === 'COMPLETED') {
      await prisma.guideProfile.update({
        where: { id: booking.guideId },
        data: {
          totalBookings: { increment: 1 },
          totalEarnings: { increment: booking.guideEarnings },
        },
      });

      // Update traveler statistics
      await prisma.travelerProfile.update({
        where: { userId: booking.travelerId },
        data: {
          totalBookings: { increment: 1 },
          totalSpent: { increment: booking.totalPrice },
        },
      });
    }

    // Update transaction status if cancelled or refunded
    if (status === 'CANCELLED' || status === 'REFUNDED') {
      await prisma.transaction.updateMany({
        where: { bookingId: id },
        data: { status: status }
      });
    }

    // Create notifications
    if (status === 'CONFIRMED') {
      await prisma.notification.create({
        data: {
          userId: booking.travelerId,
          type: 'BOOKING',
          title: 'Booking Confirmed',
          message: `${booking.guide.user.name} confirmed your booking!`,
          actionUrl: `/bookings/${booking.id}`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance (confirm or report no-show)
// @route   PATCH /api/bookings/:id/confirm-attendance
// @access  Private
exports.confirmAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'CONFIRMED' or 'NO_SHOW'
    const userId = req.user.id;
    
    // Default to CONFIRMED if not provided (backward compatibility)
    const newStatus = status || 'CONFIRMED'; 

    if (!['CONFIRMED', 'NO_SHOW'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be CONFIRMED or NO_SHOW',
      });
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        traveler: { include: { user: true } },
        guide: { include: { user: true } },
        transaction: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking is completed (past date)
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate >= today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report attendance before the tour date',
      });
    }

    // Check if user is part of this booking
    if (
      booking.traveler.userId !== userId &&
      booking.guide.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    // Determine role and set update data
    const isTraveler = booking.traveler.userId === userId;
    const otherPartyStatus = isTraveler ? booking.guideAttendance : booking.travelerAttendance;
    
    const updateData = {};

    // 1. Update the User's Attendance
    if (isTraveler) {
      if (booking.travelerAttendance !== 'PENDING') {
         return res.status(400).json({ success: false, message: 'You have already reported your attendance' });
      }
      updateData.travelerAttendance = newStatus;
      updateData.travelerConfirmedAt = new Date();
    } else {
      if (booking.guideAttendance !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'You have already reported your attendance' });
      }
      updateData.guideAttendance = newStatus;
      updateData.guideConfirmedAt = new Date();
    }

    // 2. Logic for Outcome based on PAIR of statuses
    // We used temporary variable for the current user's new status, and 'otherPartyStatus' for the other.
    let finalBookingStatus = booking.status; // Default to current
    let messageToUser = 'Attendance reported.';
    let transactionUpdate = null;
    let guideStatsUpdate = null;
    let notifications = [];

    // --- Scenario A: Other party is still PENDING ---
    if (otherPartyStatus === 'PENDING') {
       // Just wait.
       messageToUser = 'Attendance reported. Waiting for the other party.';
       
       // Notify other party
       const otherUserId = isTraveler ? booking.guide.userId : booking.traveler.userId;
       const userName = isTraveler ? booking.traveler.user.name : booking.guide.user.name;
       notifications.push({
          userId: otherUserId,
          type: 'BOOKING',
          title: 'Attendance Update',
          message: `${userName} has reported their attendance. Please report yours to finalize the booking.`,
          actionUrl: `/bookings/${booking.id}`,
       });
    }
    
    // --- Scenario B: Both reported something ---
    else {
      // We have newStatus (User) and otherPartyStatus (Other)
      
      // Case 1: CONFIRMED + CONFIRMED = SUCCESS
      if (newStatus === 'CONFIRMED' && otherPartyStatus === 'CONFIRMED') {
          finalBookingStatus = 'COMPLETED';
          messageToUser = 'Both confirmed! Booking completed.';
          
          // Money Logic
          if (booking.transaction) {
             transactionUpdate = { escrowStatus: 'RELEASED', status: 'COMPLETED' };
             guideStatsUpdate = { totalEarnings: { increment: booking.guideEarnings }, totalBookings: { increment: 1 } };
             
             // Traveler stats
             await prisma.travelerProfile.update({
                where: { userId: booking.travelerId },
                data: { totalBookings: { increment: 1 }, totalSpent: { increment: booking.totalPrice } },
             });
             
             // Notify Payment
             notifications.push({
                userId: booking.traveler.userId,
                type: 'PAYMENT',
                title: 'Payment Released',
                message: `Payment released to ${booking.guide.user.name}`,
                actionUrl: `/bookings/${booking.id}`,
             }, {
                userId: booking.guide.userId,
                type: 'PAYMENT',
                title: 'Payment Received',
                message: `You earned $${Number(booking.guideEarnings).toFixed(2)}`,
                actionUrl: `/guide/earnings`,
             });
          }
      } 
      
      // Case 2: CONFIRMED + NO_SHOW = DISPUTE
      else if (
          (newStatus === 'CONFIRMED' && otherPartyStatus === 'NO_SHOW') ||
          (newStatus === 'NO_SHOW' && otherPartyStatus === 'CONFIRMED')
      ) {
          finalBookingStatus = 'DISPUTED';
          messageToUser = 'Conflict detected. Booking marked as Disputed. Admin will review.';
          notifications.push({
             userId: booking.traveler.userId,
             type: 'BOOKING',
             title: 'Booking Disputed',
             message: 'Attendance mismatch detected. Admin has been notified.',
             actionUrl: `/bookings/${booking.id}`,
          }, {
             userId: booking.guide.userId,
             type: 'BOOKING',
             title: 'Booking Disputed',
             message: 'Attendance mismatch detected. Admin has been notified.',
             actionUrl: `/bookings/${booking.id}`,
          });
          
          // Todo: Notify Admin (Not implemented in this snippet, but implicitly via Status)
      }
      
      // Case 3: NO_SHOW + NO_SHOW = MUTUAL NO SHOW
      else if (newStatus === 'NO_SHOW' && otherPartyStatus === 'NO_SHOW') {
          finalBookingStatus = 'NO_SHOW_BOTH';
          messageToUser = 'Both parties reported No-Show. Booking cancelled.';
          
           if (booking.transaction) {
             // Depending on policy: Refund traveler? 
             // For now, let's assume REFUND to traveler
             transactionUpdate = { escrowStatus: 'REFUNDED', status: 'REFUNDED' };
             
             notifications.push({
                userId: booking.traveler.userId,
                type: 'PAYMENT',
                title: 'Refund Initiated',
                message: `Booking marked as No-Show (Both). Refund initiated.`,
                actionUrl: `/bookings/${booking.id}`,
             });
          }
      }
    }

    // Execute Updates
    updateData.status = finalBookingStatus;
    if (finalBookingStatus === 'COMPLETED') updateData.completedAt = new Date();

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        traveler: { include: { user: true } },
        guide: { include: { user: true } },
        transaction: true,
      },
    });
    
    if (transactionUpdate) {
       await prisma.transaction.update({
          where: { id: updatedBooking.transaction.id },
          data: transactionUpdate,
       });
    }
    
    if (guideStatsUpdate) {
       await prisma.guideProfile.update({
          where: { id: booking.guideId },
          data: guideStatsUpdate,
       });
    }

    if (notifications.length > 0) {
       await prisma.notification.createMany({ data: notifications });
    }

    res.status(200).json({
      success: true,
      message: messageToUser,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, userId } = req.body;

    // 1. Get current Booking details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { 
        transaction: true, 
        guide: { select: { userId: true, user: { select: { name: true } } } },
        traveler: { select: { userId: true, user: { select: { name: true } } } }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Identify who is resolving
    const isGuide = userId === booking.guide.userId;
    const isTraveler = userId === booking.traveler.userId;

    if (!isGuide && !isTraveler) {
       // Allow Admin override if needed, but for now strict
       return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // 2. Logic based on Time & Initiator
    const tourDate = new Date(booking.bookingDate);
    const [hours, minutes] = booking.bookingTime.split(':');
    tourDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const diffMs = tourDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    let refundAmount = 0;
    let guideEarningsAdjustment = 0;
    let cancelStatus = 'CANCELLED';
    let transactionStatus = 'CANCELLED';
    let transactionDesc = '';
    let notifications = [];

    // --- Scenario A: Traveler Cancels ---
    if (isTraveler) {
        if (diffHours > 24) {
            // Tier 1: Flexible (> 24 Hours) -> 100% Refund
            refundAmount = booking.totalPrice;
            guideEarningsAdjustment = 0;
            transactionStatus = 'REFUNDED';
            transactionDesc = 'Cancelled by Traveler (>24h). Full Refund.';
            
            notifications.push({
                userId: booking.travelerId,
                title: 'Booking Cancelled',
                message: 'Free cancellation successful. Full refund initiated.'
            }, {
                userId: booking.guide.userId,
                title: 'Booking Cancelled',
                message: 'Traveler cancelled early. No earnings generated.'
            });

        } else if (diffHours > 2) {
            // Tier 2: Late (2h - 24h) -> 50% Refund
            refundAmount = booking.totalPrice * 0.50;
            guideEarningsAdjustment = booking.totalPrice * 0.25; // Compensation
            transactionStatus = 'REFUNDED_PARTIAL';
            transactionDesc = 'Cancelled by Traveler (2h-24h). 50% Refund.';

            // Track missed spend
            await prisma.travelerProfile.update({
                where: { userId: booking.travelerId },
                data: { totalSpent: { increment: (booking.totalPrice - refundAmount) } }
            });
            
            notifications.push({
                userId: booking.travelerId,
                title: 'Late Cancellation',
                message: 'Cancelled within 24h. 50% refund processed.'
            }, {
                userId: booking.guide.userId,
                title: 'Late Cancellation',
                message: `Traveler cancelled late. You received compensation: $${guideEarningsAdjustment}.`
            });

        } else {
            // Tier 3: Last Minute (< 2h) -> 0% Refund
            refundAmount = 0;
            guideEarningsAdjustment = booking.totalPrice * 0.90; // Guide gets full share
            transactionStatus = 'COMPLETED'; // Money kept
            transactionDesc = 'Cancelled by Traveler (<2h). Non-refundable.';

            await prisma.travelerProfile.update({
                where: { userId: booking.travelerId },
                data: { totalSpent: { increment: booking.totalPrice } }
            });

            notifications.push({
                userId: booking.travelerId,
                title: 'Non-Refundable Cancellation',
                message: 'Cancelled less than 2h before start. No refund issued.'
            }, {
                userId: booking.guide.userId,
                title: 'Booking Cancelled',
                message: `Traveler cancelled last minute. You received full pay: $${guideEarningsAdjustment}.`
            });
        }
    } 
    
    // --- Scenario B: Guide Cancels ---
    else {
        // Guide always triggers Full Refund to Traveler
        refundAmount = booking.totalPrice;
        guideEarningsAdjustment = 0;
        transactionStatus = 'REFUNDED';
        transactionDesc = 'Cancelled by Guide. Full Refund.';

        notifications.push({
             userId: booking.travelerId,
             title: 'Tour Cancelled by Guide',
             message: 'Guide cancelled the tour. Full refund issued.'
        }, {
             userId: booking.guide.userId,
             title: 'Booking Cancelled',
             message: 'You cancelled the booking. No earnings.'
        });
    }

    // Add common fields to notifications
    notifications = notifications.map(n => ({
        ...n,
        type: 'BOOKING',
        actionUrl: `/bookings/${id}`
    }));

    // Execute Updates
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        cancelledBy: userId,
        guideEarnings: guideEarningsAdjustment 
      },
      include: { transaction: true } // Return transaction to confirmation
    });

    
    // Pay Guide (or set distinct earnings if any)
    if (guideEarningsAdjustment > 0) {
        await prisma.guideProfile.update({
            where: { id: booking.guideId },
            data: { totalEarnings: { increment: guideEarningsAdjustment } }
        });
    }

    // Update Transaction
    if (booking.transaction) {
         await prisma.transaction.update({
            where: { id: booking.transaction.id },
            data: { 
                status: transactionStatus,
                description: transactionDesc,
                escrowStatus: transactionStatus === 'REFUNDED' ? 'REFUNDED' : 'REFUNDED_PARTIAL'
            }
         });
    }

    // Send Notifications
    if (notifications.length > 0) {
       await prisma.notification.createMany({ data: notifications });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
