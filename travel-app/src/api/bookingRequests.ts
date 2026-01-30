import apiClient from './client';

export interface BookingRequest {
  id: string;
  travelerId: string;
  guideId: string;
  bookingDate: string;
  bookingTime: string;
  duration: 'HALF_DAY' | 'FULL_DAY';
  participantCount: number;
  message?: string;
  status: RequestStatus;
  estimatedPrice?: number;
  guideResponse?: string;
  respondedAt?: string;
  paymentDeadline?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  traveler: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  guide: {
    id: string;
    city: string;
    university: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
  booking?: {
    id: string;
    status: string;
  };
}

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_EXPIRED'
  | 'CANCELLED';

export interface CreateBookingRequestData {
  guideId: string;
  bookingDate: string;
  bookingTime: string;
  duration: 'HALF_DAY' | 'FULL_DAY';
  participantCount?: number;
  message?: string;
}

export interface BookingRequestResponse {
  success: boolean;
  message?: string;
  data?: BookingRequest;
  count?: number;
}

// Create new booking request
export const createBookingRequest = async (
  data: CreateBookingRequestData
): Promise<BookingRequest> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: BookingRequest }>(
      '/booking-requests',
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create booking request');
  }
};

// Get my booking requests (traveler or guide)
export const getMyBookingRequests = async (
  userId: string,
  userRole: 'TRAVELER' | 'STUDENT_GUIDE'
): Promise<BookingRequest[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: BookingRequest[] }>(
      '/booking-requests',
      {
        params: { userId, userRole },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching booking requests:', error);
    return [];
  }
};

// Accept or reject booking request (guide)
export const respondToBookingRequest = async (
  requestId: string,
  action: 'accept' | 'reject',
  guideResponse?: string
): Promise<BookingRequest> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: BookingRequest }>(
      `/booking-requests/${requestId}`,
      { action, guideResponse }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Failed to ${action} request`);
  }
};

// Complete payment for accepted request (traveler)
export const completeRequestPayment = async (
  requestId: string,
  paymentMethod: string,
  paymentDetails?: any
): Promise<{ booking: any; request: BookingRequest }> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: { booking: any; request: BookingRequest };
    }>(`/booking-requests/${requestId}/payment`, {
      paymentMethod,
      paymentDetails,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment failed');
  }
};

// Cancel booking request
export const cancelBookingRequest = async (requestId: string): Promise<void> => {
  try {
    await apiClient.delete(`/booking-requests/${requestId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel request');
  }
};

// Get time remaining until expiration
export const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
};

// Get status badge color
export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PAYMENT_EXPIRED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-slate-100 text-slate-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status display text
export const getStatusText = (status: RequestStatus): string => {
  const texts: Record<RequestStatus, string> = {
    PENDING: 'Awaiting Response',
    ACCEPTED: 'Accepted - Payment Required',
    REJECTED: 'Declined',
    EXPIRED: 'Expired',
    PAYMENT_PENDING: 'Payment Pending',
    PAID: 'Paid - Booking Confirmed',
    PAYMENT_EXPIRED: 'Payment Deadline Passed',
    CANCELLED: 'Cancelled',
  };
  return texts[status] || status;
};
