const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to sign Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Create profile based on role
    if (role === 'TRAVELER') {
      await prisma.travelerProfile.create({
        data: {
          userId: user.id,
          languages: ['English'],
        },
      });
    } else if (role === 'STUDENT_GUIDE') {
      await prisma.guideProfile.create({
        data: {
          userId: user.id,
          university: '',
          bio: '',
          hourlyRate: 25,
          city: '',
          languages: ['English'],
          tags: [],
        },
      });
    }

    // Generate JWT token
    const token = signToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        travelerProfile: true,
        guideProfile: true, // Needed for frontend context sometimes
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = signToken(user.id, user.role);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login (Create if not exists)
// @route   POST /api/users/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    // 1. Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        travelerProfile: true,
        guideProfile: true
      }
    });

    if (!user) {
       // 2. If not, create user (auto-verified email)
       // Use googleId as password (hashed) just to fill the field, though they won't use password login usually
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, salt);

       user = await prisma.user.create({
          data: {
             email,
             name,
             password: hashedPassword,
             role: 'TRAVELER', // Default role for Google Login
             isEmailVerified: true,
             profileImage: avatar,
             updatedAt: new Date()
          }
       });

       // Create Traveler Profile
       await prisma.travelerProfile.create({
          data: {
             userId: user.id,
             languages: ['English'],
             // Additional defaults if needed
          }
       });
       
       // Reload user with relations
       user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { travelerProfile: true }
       });
    }

    // 3. Generate Token
    const token = signToken(user.id, user.role);

    // 4. Return response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage,
        },
        token,
      },
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        travelerProfile: true,
        guideProfile: true,
      },
    });

    // Update last seen/online status if viewing own profile
    if (req.user && req.user.id === id) {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() }
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/:id
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { 
      name, 
      phoneNumber, 
      profileImage,
      gender,
      isOnline,
      showOnlineStatus,
      // Traveler specific fields
      bio,
      location,
      languages,
      interests
    } = req.body;

    // Check permissions
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Handle file upload
    if (req.file) {
      // Assuming server serves statically from root or /uploads
      // Use a relative path or full URL depending on your frontend config
      // Here we store relative path matching the static serve in server.js
      profileImage = `/uploads/${req.file.filename}`;
    }

    // Update User core data
    const updateData = {
      name,
      phoneNumber,
      profileImage,
    };
    
    if (gender !== undefined) updateData.gender = gender;
    if (isOnline !== undefined) updateData.isOnline = isOnline === 'true' || isOnline === true;
    if (showOnlineStatus !== undefined) updateData.showOnlineStatus = showOnlineStatus === 'true' || showOnlineStatus === true;
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Verify and Format languages/interests for JSON
    if (user.role === 'TRAVELER') {
        const travelerData = {};
        if (bio !== undefined) travelerData.bio = bio;
        if (location !== undefined) travelerData.location = location;
        
        if (languages !== undefined) {
           // Ensure it is an array
           travelerData.languages = Array.isArray(languages) ? languages : [languages];
        }

        if (interests !== undefined) {
           travelerData.interests = Array.isArray(interests) ? interests : [interests];
        }

        if (Object.keys(travelerData).length > 0) {
           await prisma.travelerProfile.update({
             where: { userId: id },
             data: travelerData
           });
        }
    }

    // Fetch updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        travelerProfile: true,
        guideProfile: true,
      },
    });

    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
