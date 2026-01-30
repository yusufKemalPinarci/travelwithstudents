const prisma = require('../config/prisma');

// @desc    Get or create conversation between two users
// @route   POST /api/messages/conversation
// @access  Private
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId1, userId2 } = req.body;
    
    // Debug log
    console.log('getOrCreateConversation request:', { userId1, userId2 });

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required',
      });
    }

    if (userId1 === userId2) {
      return res.status(400).json({
        success: false,
        message: 'You cannot message yourself',
      });
    }

    // Verify users exist
    const user1 = await prisma.user.findUnique({ where: { id: userId1 } });
    const user2 = await prisma.user.findUnique({ where: { id: userId2 } });

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found',
      });
    }

    // Check if conversation exists (more robust query)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } }
        ]
      },
      include: {
        participants: {
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation,
      });
    }

    // Create new conversation
    // We do this in two steps to avoid "Inconsistent query result" errors
    // if the relation resolution is lagging or confused in the single transaction
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
    });

    // Fetch the created conversation with details
    const conversation = await prisma.conversation.findUnique({
        where: { id: newConversation.id },
        include: {
            participants: {
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
            messages: true,
        },
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's conversations
// @route   GET /api/messages/conversations/:userId
// @access  Private
exports.getUserConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform data to match frontend format
    const transformedConversations = await Promise.all(
      conversations
        .filter(conv => conv.messages.length > 0) // Only show conversations with messages
        .map(async conv => {
          const otherParticipant = conv.participants.find(p => p.userId !== userId);
          const lastMessage = conv.messages[0];
          
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
              isRead: false
            }
          });

          return {
            id: conv.id,
            participant: otherParticipant?.user,
            lastMessage: lastMessage?.content || '',
            timestamp: lastMessage?.createdAt || conv.createdAt,
            unread: unreadCount > 0,
            unreadCount,
          };
        })
    );

    res.status(200).json({
      success: true,
      count: transformedConversations.length,
      data: transformedConversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, senderId, content, bookingData } = req.body;

    if (!conversationId || !senderId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        bookingData: bookingData ? bookingData : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Get other participant to create notification
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: {
            userId: { not: senderId },
          },
        },
      },
    });

    if (conversation.participants.length > 0) {
      await prisma.notification.create({
        data: {
          userId: conversation.participants[0].userId,
          type: 'MESSAGE',
          title: 'New Message',
          message: `${message.sender.name} sent you a message`,
          actionUrl: `/messages/${conversationId}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit),
      skip,
    });

    const total = await prisma.message.count({
      where: { conversationId },
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept booking proposal
// @route   PUT /api/messages/:messageId/accept-booking
// @access  Private
exports.acceptBookingProposal = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { bookingId } = req.body;

    // Update message with booking ID
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        bookingId,
        bookingData: {
          ...message.bookingData,
          status: 'ACCEPTED',
        },
      },
    });

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
