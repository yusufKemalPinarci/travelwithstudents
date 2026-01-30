import apiClient from './client';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  bookingId?: string | null;
  bookingData?: any;
  sender?: {
    id: string;
    name: string;
    profileImage: string;
  };
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    profileImage: string;
    role: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount: number;
}

export interface MessageResponse {
  success: boolean;
  data: Message | Message[] | Conversation | Conversation[];
  count?: number;
  total?: number;
}

// Kullanıcının tüm konuşmalarını getir
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<MessageResponse>(`/messages/conversations/${userId}`);
    const data = response.data as any;
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Konuşma oluştur veya getir
export const getOrCreateConversation = async (userId1: string, userId2: string): Promise<Conversation | null> => {
  try {
    const response = await apiClient.post<MessageResponse>('/messages/conversation', {
      userId1,
      userId2,
    });
    return Array.isArray(response.data.data) ? null : response.data.data as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Konuşmadaki mesajları getir
export const getMessages = async (conversationId: string, limit = 50, page = 1): Promise<Message[]> => {
  try {
    const response = await apiClient.get<MessageResponse>(
      `/messages/${conversationId}?limit=${limit}&page=${page}`
    );
    const data = response.data as any;
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Mesaj gönder
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  bookingData?: any
): Promise<Message | null> => {
  try {
    const response = await apiClient.post<MessageResponse>('/messages', {
      conversationId,
      senderId,
      content,
      bookingData,
    });
    return Array.isArray(response.data.data) ? null : response.data.data as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Randevu teklifi gönder
export const sendBookingProposal = async (
  conversationId: string,
  senderId: string,
  bookingData: {
    tourId?: string;
    date: string;
    time: string;
    duration?: string;
    participants?: number;
    notes?: string;
  }
): Promise<Message | null> => {
  try {
    const message = bookingData.tourId 
      ? `📅 Tour Booking Proposal: ${bookingData.date} at ${bookingData.time} for ${bookingData.participants || 1} person(s)`
      : `📅 Booking Proposal: ${bookingData.date} at ${bookingData.time} (${bookingData.duration || 'Half Day'})`;
    
    const response = await apiClient.post<MessageResponse>('/messages', {
      conversationId,
      senderId,
      content: message,
      bookingData: { ...bookingData, status: 'PENDING' },
    });
    return Array.isArray(response.data.data) ? null : response.data.data as Message;
  } catch (error) {
    console.error('Error sending booking proposal:', error);
    return null;
  }
};

// Mesajları okundu olarak işaretle
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    await apiClient.put(`/messages/read/${conversationId}`, { userId });
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};
