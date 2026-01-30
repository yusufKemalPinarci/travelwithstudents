const prisma = require('../config/prisma');

/**
 * PAYMENT FLOW SCENARIOS
 * ======================
 * 
 * 1. BOTH SHOWED UP (guideAttendance: CONFIRMED, travelerAttendance: CONFIRMED)
 *    - Release payment to guide (minus platform fee)
 *    - Status: COMPLETED
 * 
 * 2. GUIDE NO-SHOW (guideAttendance: NO_SHOW)
 *    - Full refund to traveler
 *    - Status: NO_SHOW_GUIDE
 * 
 * 3. TRAVELER NO-SHOW (travelerAttendance: NO_SHOW)
 *    - Pay guide (minus platform fee)
 *    - Status: NO_SHOW_TRAVELER
 * 
 * 4. BOTH NO-SHOW (both NO_SHOW)
 *    - Refund to traveler
 *    - Status: NO_SHOW_BOTH
 * 
 * 5. CANCELLED BEFORE MEETING
 *    - Refund to traveler (may apply cancellation fee)
 *    - Status: CANCELLED
 */

// @desc    Create mock payment (escrow)
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod = 'MOCK' } = req.body;
    const userId = req.user.id;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guide: true,
        traveler: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if transaction already exists for this booking
    const existingTransaction = await prisma.transaction.findUnique({
      where: { bookingId },
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        data: existingTransaction,
        message: 'Payment already processed for this booking',
      });
    }

    // Create transaction in ESCROW
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        bookingId,
        guideId: booking.guideId,
        type: 'BOOKING_PAYMENT',
        amount: amount,
        currency: 'USD',
        status: 'COMPLETED', // Payment successful
        escrowStatus: 'HELD', // Money held in escrow
        paymentMethod,
        description: `Payment for booking ${bookingId}`,
        metadata: {
          mockPayment: true,
          note: 'This is a mock payment for testing. Real payment integration pending.',
        },
        processedAt: new Date(),
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Payment held in escrow. Funds will be released after meeting confirmation.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm attendance (guide or traveler)
// @route   PUT /api/payments/confirm-attendance/:bookingId
// @access  Private
exports.confirmAttendance = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { attended } = req.body; // true/false

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guide: { include: { user: true } },
        traveler: true,
        transaction: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user is guide or traveler
    const isGuide = booking.guide.userId === userId;
    const isTraveler = booking.travelerId === userId;

    if (!isGuide && !isTraveler) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update attendance
    const updateData = {};
    if (isGuide) {
      updateData.guideAttendance = attended ? 'CONFIRMED' : 'NO_SHOW';
      updateData.guideConfirmedAt = new Date();
    } else {
      updateData.travelerAttendance = attended ? 'CONFIRMED' : 'NO_SHOW';
      updateData.travelerConfirmedAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    // Check if both confirmed attendance
    const bothConfirmed =
      updatedBooking.guideAttendance !== 'PENDING' &&
      updatedBooking.travelerAttendance !== 'PENDING';

    if (bothConfirmed) {
      // Process payment based on scenario
      await processPaymentScenario(updatedBooking);
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: 'Attendance confirmed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment based on attendance scenario
async function processPaymentScenario(booking) {
  const transaction = await prisma.transaction.findUnique({
    where: { bookingId: booking.id },
  });

  if (!transaction || transaction.escrowStatus !== 'HELD') {
    return; // No transaction or already processed
  }

  const guideShowed = booking.guideAttendance === 'CONFIRMED';
  const travelerShowed = booking.travelerAttendance === 'CONFIRMED';

  let newBookingStatus;
  let escrowStatus;
  let payoutAmount = 0;
  let refundAmount = 0;

  // SCENARIO 1: Both showed up
  if (guideShowed && travelerShowed) {
    newBookingStatus = 'COMPLETED';
    escrowStatus = 'RELEASED';
    payoutAmount = booking.guideEarnings; // Platform fee already deducted
    
    // Create payout transaction for guide
    await prisma.transaction.create({
      data: {
        userId: booking.guide.userId,
        bookingId: booking.id,
        guideId: booking.guideId,
        type: 'PAYOUT',
        amount: payoutAmount,
        currency: 'USD',
        status: 'COMPLETED',
        escrowStatus: 'RELEASED',
        paymentMethod: transaction.paymentMethod,
        description: `Payout for completed booking ${booking.id}`,
        processedAt: new Date(),
        releasedAt: new Date(),
      },
    });

    // Create platform fee transaction
    await prisma.transaction.create({
      data: {
        userId: booking.travelerId,
        bookingId: booking.id,
        type: 'PLATFORM_FEE',
        amount: booking.platformFee,
        currency: 'USD',
        status: 'COMPLETED',
        description: `Platform fee for booking ${booking.id}`,
        processedAt: new Date(),
      },
    });
  }
  // SCENARIO 2: Guide didn't show
  else if (!guideShowed) {
    newBookingStatus = travelerShowed ? 'NO_SHOW_GUIDE' : 'NO_SHOW_BOTH';
    escrowStatus = 'REFUNDED';
    refundAmount = booking.totalPrice; // Full refund

    // Create refund transaction
    await prisma.transaction.create({
      data: {
        userId: booking.travelerId,
        bookingId: booking.id,
        type: 'REFUND',
        amount: refundAmount,
        currency: 'USD',
        status: 'COMPLETED',
        escrowStatus: 'REFUNDED',
        paymentMethod: transaction.paymentMethod,
        description: `Refund due to guide no-show for booking ${booking.id}`,
        processedAt: new Date(),
        refundedAt: new Date(),
      },
    });
  }
  // SCENARIO 3: Traveler didn't show (guide showed up)
  else if (!travelerShowed && guideShowed) {
    newBookingStatus = 'NO_SHOW_TRAVELER';
    escrowStatus = 'RELEASED';
    payoutAmount = booking.guideEarnings; // Pay guide anyway

    // Create payout transaction for guide
    await prisma.transaction.create({
      data: {
        userId: booking.guide.userId,
        bookingId: booking.id,
        guideId: booking.guideId,
        type: 'PAYOUT',
        amount: payoutAmount,
        currency: 'USD',
        status: 'COMPLETED',
        escrowStatus: 'RELEASED',
        paymentMethod: transaction.paymentMethod,
        description: `Payout for booking ${booking.id} (traveler no-show)`,
        processedAt: new Date(),
        releasedAt: new Date(),
      },
    });

    // Platform fee still collected
    await prisma.transaction.create({
      data: {
        userId: booking.travelerId,
        bookingId: booking.id,
        type: 'PLATFORM_FEE',
        amount: booking.platformFee,
        currency: 'USD',
        status: 'COMPLETED',
        description: `Platform fee for booking ${booking.id}`,
        processedAt: new Date(),
      },
    });
  }

  // Update transaction escrow status
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      escrowStatus,
      ...(escrowStatus === 'RELEASED' && { releasedAt: new Date() }),
      ...(escrowStatus === 'REFUNDED' && { refundedAt: new Date() }),
    },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: newBookingStatus,
      completedAt: new Date(),
    },
  });
}

// @desc    Get payment/transaction details
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and refund (before meeting)
// @route   POST /api/payments/cancel/:bookingId
// @access  Private
exports.cancelAndRefund = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transaction: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if cancellation is allowed (e.g., not too close to booking date)
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

    let refundAmount = booking.totalPrice;
    let cancellationFee = 0;

    // Apply cancellation fee if less than 24 hours
    if (hoursUntilBooking < 24 && hoursUntilBooking > 0) {
      cancellationFee = booking.totalPrice * 0.2; // 20% cancellation fee
      refundAmount = booking.totalPrice - cancellationFee;
    }

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
    });

    // Update escrow transaction
    if (booking.transaction) {
      await prisma.transaction.update({
        where: { id: booking.transaction.id },
        data: {
          escrowStatus: 'REFUNDED',
          status: 'REFUNDED',
          refundedAt: new Date(),
        },
      });

      // Create refund transaction
      await prisma.transaction.create({
        data: {
          userId: booking.travelerId,
          bookingId: booking.id,
          type: 'REFUND',
          amount: refundAmount,
          currency: 'USD',
          status: 'COMPLETED',
          escrowStatus: 'REFUNDED',
          paymentMethod: booking.transaction.paymentMethod,
          description: `Refund for cancelled booking ${bookingId}`,
          metadata: {
            cancellationFee,
            originalAmount: booking.totalPrice,
          },
          processedAt: new Date(),
          refundedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and refund processed',
      data: {
        refundAmount,
        cancellationFee,
        originalAmount: booking.totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};
