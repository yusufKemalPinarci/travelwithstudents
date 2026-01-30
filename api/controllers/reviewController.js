const prisma = require('../config/prisma');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Traveler only)
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, guideId, rating, comment, tags } = req.body;
    const travelerId = req.user.id; // Use authenticated user ID

    // Validate required fields
    if (!bookingId || !guideId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Security & Integrity Checks
    if (booking.travelerId !== travelerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings',
      });
    }

    if (booking.guideId !== guideId) {
      return res.status(400).json({
        success: false,
        message: 'Booking does not match the guide provided',
      });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings',
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking',
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        guideId,
        travelerId,
        rating,
        comment,
        tags: tags || [],
      },
      include: {
        traveler: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Update guide's average rating and review count
    const guideReviews = await prisma.review.findMany({
      where: { guideId },
      select: { rating: true },
    });

    const totalRating = guideReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / guideReviews.length;

    await prisma.guideProfile.update({
      where: { id: guideId },
      data: {
        averageRating,
        totalReviews: guideReviews.length,
      },
    });

    // Create notification for guide
    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideId },
      select: { userId: true },
    });

    await prisma.notification.create({
      data: {
        userId: guide.userId,
        type: 'REVIEW',
        title: 'New Review',
        message: `${review.traveler.name} left you a ${rating}-star review!`,
        actionUrl: `/guide/reviews`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a guide
// @route   GET /api/reviews/guide/:guideId
// @access  Public
exports.getGuideReviews = async (req, res, next) => {
  try {
    const { guideId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await prisma.review.findMany({
      where: { guideId },
      include: {
        traveler: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip,
    });

    const total = await prisma.review.count({
      where: { guideId },
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private (Guide only)
exports.replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id; // Logged in user ID

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response',
      });
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        guide: true,
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if the logged in user is the owner of the guide profile
    if (review.guide.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reply to this review',
      });
    }

    // Update review with response
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        response,
        respondedAt: new Date(),
      },
      include: {
        traveler: {
          select: {
            name: true,
            profileImage: true,
          }
        }
      }
    });

    // Notify traveler
    await prisma.notification.create({
      data: {
        userId: review.travelerId,
        type: 'REVIEW_REPLY',
        title: 'Guide Replied to Your Review',
        message: `The guide has replied to your review for ${review.guide.city} tour.`,
        actionUrl: `/traveler/${review.travelerId}`, // Or where they can see their reviews
      },
    });

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, tags } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
        tags,
      },
    });

    // Recalculate guide's average rating
    const guideReviews = await prisma.review.findMany({
      where: { guideId: review.guideId },
      select: { rating: true },
    });

    const totalRating = guideReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / guideReviews.length;

    await prisma.guideProfile.update({
      where: { id: review.guideId },
      data: { averageRating },
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.delete({
      where: { id },
    });

    // Recalculate guide's average rating
    const guideReviews = await prisma.review.findMany({
      where: { guideId: review.guideId },
      select: { rating: true },
    });

    const averageRating = guideReviews.length
      ? guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length
      : 0;

    await prisma.guideProfile.update({
      where: { id: review.guideId },
      data: {
        averageRating,
        totalReviews: guideReviews.length,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
