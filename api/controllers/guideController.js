const prisma = require('../config/prisma');

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
exports.getAllGuides = async (req, res, next) => {
  try {
    const { city, minRating, maxPrice, tags, search, date } = req.query;

    // Build filter object
    const where = {
      user: {
        role: 'STUDENT_GUIDE',
        status: 'ACTIVE',
      },
      isAvailable: true,
    };

    // Apply filters
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.hourlyRate = { lte: parseFloat(maxPrice) };
    }

    // Search in bio, university, or city
    if (search) {
      where.OR = [
        { bio: { contains: search, mode: 'insensitive' } },
        { university: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const guides = await prisma.guideProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            isPhoneVerified: true,
            gender: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            traveler: {
              select: {
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        bookings: date ? {
          where: {
            bookingDate: {
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            },
            status: { in: ['PENDING', 'CONFIRMED'] }
          },
          select: {
            id: true,
            bookingTime: true,
            duration: true
          }
        } : false,
        tours: date ? {
          where: {
            tourDate: {
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            },
            isActive: true
          },
          select: {
            id: true,
            tourTime: true,
            duration: true
          }
        } : false,
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
      ],
    });

    // Filter out guides who are fully booked on the selected date
    let availableGuides = guides;
    if (date) {
      availableGuides = guides.filter(guide => {
        // If guide has bookings or tours covering the whole day, filter them out
        const hasAllDayBooking = guide.bookings?.some(b => b.duration === 'FULL_DAY');
        const hasMultipleBookings = (guide.bookings?.length || 0) + (guide.tours?.length || 0) >= 3; // Arbitrary threshold
        return !hasAllDayBooking && !hasMultipleBookings;
      });
    }

    // Transform data to match frontend expectations
    const transformedGuides = availableGuides.map(guide => ({
      id: guide.id,
      userId: guide.user.id, // Added userId
      name: guide.user.name,
      email: guide.user.email,
      city: guide.city,
      university: guide.university,
      rating: parseFloat(guide.averageRating),
      reviews: guide.totalReviews,
      totalBookings: guide.totalBookings,
      price: parseFloat(guide.hourlyRate),
      bio: guide.bio,
      tags: guide.tags,
      image: guide.user.profileImage,
      gender: guide.user.gender,
      lat: guide.latitude ? parseFloat(guide.latitude) : null,
      lng: guide.longitude ? parseFloat(guide.longitude) : null,
      isPhoneVerified: guide.user.isPhoneVerified,
      languages: guide.languages,
      responseTime: guide.responseTime,
      verified: guide.studentIdVerified,
      recentReviews: guide.reviews,
    }));

    res.status(200).json({
      success: true,
      count: transformedGuides.length,
      data: transformedGuides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single guide by ID
// @route   GET /api/guides/:id
// @access  Public
exports.getGuideById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guideProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            isPhoneVerified: true,
            gender: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            traveler: {
              select: {
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found',
      });
    }

    // Increment profile views
    await prisma.guideProfile.update({
      where: { id },
      data: {
        profileViews: { increment: 1 },
      },
    });

    // Transform data
    const transformedGuide = {
      id: guide.id,
      userId: guide.user.id, // Added userId
      name: guide.user.name,
      email: guide.user.email,
      city: guide.city,
      country: guide.country,
      university: guide.university,
      major: guide.major,
      graduationYear: guide.graduationYear,
      rating: parseFloat(guide.averageRating),
      reviews: guide.totalReviews,
      totalBookings: guide.totalBookings,
      price: parseFloat(guide.hourlyRate),
      bio: guide.bio,
      motto: guide.motto,
      tags: guide.tags,
      languages: guide.languages,
      image: guide.user.profileImage,
      gender: guide.user.gender,
      gallery: guide.gallery,
      lat: guide.latitude ? parseFloat(guide.latitude) : null,
      lng: guide.longitude ? parseFloat(guide.longitude) : null,
      isPhoneVerified: guide.user.isPhoneVerified,
      responseTime: guide.responseTime,
      verified: guide.studentIdVerified,
      totalEarnings: parseFloat(guide.totalEarnings),
      profileViews: guide.profileViews,
      completedTours: guide.bookings.length,
      joinedAt: guide.user.createdAt,
      availability: guide.availability,
      reviewsList: guide.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        tags: review.tags,
        createdAt: review.createdAt,
        travelerName: review.traveler.name,
        travelerImage: review.traveler.profileImage,
      })),
    };

    res.status(200).json({
      success: true,
      data: transformedGuide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guides by city
// @route   GET /api/guides/city/:city
// @access  Public
exports.getGuidesByCity = async (req, res, next) => {
  try {
    const { city } = req.params;

    const guides = await prisma.guideProfile.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
        isAvailable: true,
        user: {
          status: 'ACTIVE',
          role: 'STUDENT_GUIDE',
        },
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
            isPhoneVerified: true,
          },
        },
      },
      orderBy: { averageRating: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update guide profile
// @route   PUT /api/guides/:id
// @access  Private (Guide only)
exports.updateGuideProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      bio,
      motto,
      hourlyRate,
      city,
      country,
      latitude,
      longitude,
      languages,
      tags,
      gallery,
      major,
      graduationYear,
      isAvailable,
      university,
    } = req.body;

    // Verify user owns this profile or is admin
    const guide = await prisma.guideProfile.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // req.user is set by authenticateJWT middleware
    if (guide.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const updatedGuide = await prisma.guideProfile.update({
      where: { id },
      data: {
        bio,
        motto,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        city,
        country,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        languages,
        tags,
        gallery,
        major,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        university,
        isAvailable,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedGuide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload guide gallery images
// @route   PUT /api/guides/:id/gallery
// @access  Private (Guide only)
exports.uploadGallery = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify user owns this profile
    const guide = await prisma.guideProfile.findUnique({
      where: { id },
      select: { userId: true, gallery: true }
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    if (guide.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Process new images
    const newImages = req.files.map(file => `/uploads/${file.filename}`);

    // Append to existing gallery
    // Ensure gallery is an array
    const currentGallery = Array.isArray(guide.gallery) ? guide.gallery : [];
    const updatedGallery = [...currentGallery, ...newImages];

    const updatedGuide = await prisma.guideProfile.update({
      where: { id },
      data: {
        gallery: updatedGallery
      }
    });

    res.status(200).json({
      success: true,
      message: 'Gallery updated successfully',
      data: updatedGuide.gallery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guide availability schedule
// @route   GET /api/guides/:id/availability
// @access  Public
exports.getGuideAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const availability = await prisma.guideAvailability.findMany({
      where: { guideId: id },
      orderBy: { dayOfWeek: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get guide availability error:', error);
    next(error);
  }
};
