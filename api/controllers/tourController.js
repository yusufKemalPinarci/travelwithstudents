const prisma = require('../config/prisma');

// Create a new tour
exports.createTour = async (req, res) => {
    try {
        const userId = req.user.id; // user.id from token payload

        // Debug: Log everything we receive
        console.log('=== TOUR CREATE REQUEST ===');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files?.length || 0, 'files');
        console.log('req.body keys:', Object.keys(req.body));
        console.log('===========================');

        // Check if user has a guide profile
        const guideProfile = await prisma.guideProfile.findUnique({
            where: { userId: userId }
        });

        if (!guideProfile) {
            return res.status(403).json({ message: 'Only guides can create tours' });
        }

        const {
            title,
            description,
            category,
            location,
            duration,
            price,
            language,
            tourDate,
            tourTime,
            maxParticipants
        } = req.body;

        // Handle uploaded photos
        const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Debug logging
        console.log('Tour creation request:', {
            title,
            description,
            category,
            location,
            hasFiles: !!req.files,
            fileCount: req.files?.length,
            bodyKeys: Object.keys(req.body)
        });

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tour title is required' });
        }
        if (!location || !location.trim()) {
            return res.status(400).json({ message: 'Location is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Description is required' });
        }
        if (!price || parseFloat(price) <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        if (!duration || parseInt(duration) < 1) {
            return res.status(400).json({ message: 'Duration must be at least 1 hour' });
        }
        if (!tourDate) {
            return res.status(400).json({ message: 'Tour date is required' });
        }
        if (!tourTime) {
            return res.status(400).json({ message: 'Tour time is required' });
        }

        const tour = await prisma.tour.create({
            data: {
                guideId: guideProfile.id,
                title,
                description,
                category,
                location,
                duration: parseInt(duration),
                price: parseFloat(price),
                language,
                photos: photos || [],
                tourDate: tourDate ? new Date(tourDate) : null,
                tourTime: tourTime || null,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : 10,
                availableSlots: maxParticipants ? parseInt(maxParticipants) : 10,
                isActive: true
            }
        });

        res.status(201).json(tour);
    } catch (error) {
        console.error("Create tour error:", error);
        res.status(500).json({ message: 'Error creating tour', error: error.message });
    }
};

// Get all tours (Public with filters)
exports.getAllTours = async (req, res) => {
    try {
        const { location, category, minPrice, maxPrice, language } = req.query;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const where = {
            isActive: true,
            tourDate: {
                gte: today // Only show tours from today onwards
            }
        };

        if (location) {
            where.location = { contains: location }; // Case insensitive if configured, else exact or partial
        }
        if (category && category !== 'All') {
            where.category = category;
        }
        if (language) {
            where.language = language;
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const tours = await prisma.tour.findMany({
            where,
            include: {
                guide: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(tours);
    } catch (error) {
        console.error("Get tours error:", error);
        res.status(500).json({ message: 'Error fetching tours' });
    }
};

// Get single tour details
exports.getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await prisma.tour.findUnique({
            where: { id },
            include: {
                guide: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                                isEmailVerified: true,
                                isPhoneVerified: true
                            }
                        },
                        reviews: {
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                traveler: {
                                    select: { name: true, profileImage: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        res.json(tour);
    } catch (error) {
        console.error("Get tour error:", error);
        res.status(500).json({ message: 'Error fetching tour details' });
    }
};

// Get tours by a specific guide
exports.getGuideTours = async (req, res) => {
    try {
        const { guideId } = req.params;
        
        const tours = await prisma.tour.findMany({
            where: { guideId, isActive: true },
            include: {
                bookings: {
                    select: {
                        id: true,
                        status: true,
                        participantCount: true
                    }
                },
                guide: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Check for expired tours and create notifications if needed
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch existing expired tour notifications for this user efficiently
        const existingNotifications = await prisma.notification.findMany({
            where: {
                userId: guideProfile.userId,
                type: 'SYSTEM',
                actionUrl: `/guide/my-tours`
            }
        });

        const notifiedTourIds = new Set(
            existingNotifications
                .filter(n => n.metadata && n.metadata.tourId)
                .map(n => n.metadata.tourId)
        );

        for (const tour of tours) {
            const tourDate = new Date(tour.tourDate);
            tourDate.setHours(0, 0, 0, 0);
            
            // If tour has passed and there's no existing notification for this tour
            if (tourDate < today) {
                if (!notifiedTourIds.has(tour.id)) {
                    await prisma.notification.create({
                        data: {
                            userId: tour.guide.userId,
                            type: 'SYSTEM',
                            title: 'Tour Date Passed',
                            message: `Your tour "${tour.title}" date has passed. It can no longer be edited or updated.`,
                            actionUrl: `/guide/my-tours`,
                            metadata: { tourId: tour.id }
                        }
                    });
                     // Add to set to prevent duplicate creation if we run again immediately (though less likely here)
                    notifiedTourIds.add(tour.id);
                }
            }
        }

        res.json(tours);
    } catch (error) {
        console.error("Get guide tours error:", error);
        res.status(500).json({ message: 'Error fetching guide tours' });
    }
};

// Update tour
exports.updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get guide profile
        const guideProfile = await prisma.guideProfile.findUnique({
            where: { userId }
        });

        if (!guideProfile) {
            return res.status(403).json({ message: 'Only guides can update tours' });
        }

        // Check if tour exists and belongs to this guide
        const existingTour = await prisma.tour.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['PENDING', 'CONFIRMED']
                        }
                    }
                }
            }
        });

        if (!existingTour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        if (existingTour.guideId !== guideProfile.id) {
            return res.status(403).json({ message: 'Not authorized to update this tour' });
        }

        // Check if tour has active bookings
        const hasActiveBookings = existingTour.bookings.length > 0;

        if (hasActiveBookings) {
            // If tour has bookings, warn about what can be changed
            const {
                title,
                description,
                photos,
                category,
                language,
                // Don't allow changing critical fields if bookings exist
            } = req.body;

            // Handle uploaded photos
            const newPhotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

            const updatedTour = await prisma.tour.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(description && { description }),
                    ...(newPhotos && { photos: newPhotos }),
                    ...(category && { category }),
                    ...(language && { language }),
                }
            });

            return res.json({
                success: true,
                message: 'Tour updated. Note: Price, date, time and duration cannot be changed for tours with active bookings',
                data: updatedTour,
                hasActiveBookings: true
            });
        }

        // No active bookings - allow full update
        const {
            title,
            description,
            category,
            location,
            duration,
            price,
            language,
            tourDate,
            tourTime,
            maxParticipants
        } = req.body;

        const newPhotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

        const updatedTour = await prisma.tour.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(category && { category }),
                ...(location && { location }),
                ...(duration && { duration: parseInt(duration) }),
                ...(price && { price: parseFloat(price) }),
                ...(language && { language }),
                ...(tourDate && { tourDate: new Date(tourDate) }),
                ...(tourTime && { tourTime }),
                ...(maxParticipants && { 
                    maxParticipants: parseInt(maxParticipants),
                    availableSlots: parseInt(maxParticipants)
                }),
                ...(newPhotos && { photos: newPhotos }),
            }
        });

        res.json({
            success: true,
            message: 'Tour updated successfully',
            data: updatedTour,
            hasActiveBookings: false
        });
    } catch (error) {
        console.error("Update tour error:", error);
        res.status(500).json({ message: 'Error updating tour', error: error.message });
    }
};

// Delete tour
exports.deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get guide profile
        const guideProfile = await prisma.guideProfile.findUnique({
            where: { userId }
        });

        if (!guideProfile) {
            return res.status(403).json({ message: 'Only guides can delete tours' });
        }

        // Check if tour exists and belongs to this guide
        const tour = await prisma.tour.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['PENDING', 'CONFIRMED']
                        }
                    }
                }
            }
        });

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        if (tour.guideId !== guideProfile.id) {
            return res.status(403).json({ message: 'Not authorized to delete this tour' });
        }

        // Check if tour has active bookings
        if (tour.bookings.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Cannot delete tour with active bookings. Please cancel or complete all bookings first.',
                activeBookingsCount: tour.bookings.length
            });
        }

        // Soft delete - set isActive to false instead of deleting
        await prisma.tour.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'Tour deleted successfully'
        });
    } catch (error) {
        console.error("Delete tour error:", error);
        res.status(500).json({ message: 'Error deleting tour', error: error.message });
    }
};
