import apiClient from './client';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  escrowStatus: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  description: string;
  createdAt: string;
  processedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: Payment | Payment[];
  message?: string;
  count?: number;
}

// Create mock payment (escrow)
export const createPayment = async (data: {
  bookingId: string;
  amount: number;
  paymentMethod?: string;
}): Promise<Payment | null> => {
  try {
    const response = await apiClient.post<PaymentResponse>('/payments/create', data);
    return Array.isArray(response.data.data) ? null : response.data.data as Payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Confirm attendance (guide or traveler)
export const confirmAttendance = async (
  bookingId: string,
  attended: boolean
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/payments/confirm-attendance/${bookingId}`,
      { attended }
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming attendance:', error);
    throw error;
  }
};

// Get payment details by booking
export const getPaymentByBooking = async (bookingId: string): Promise<Payment[]> => {
  try {
    const response = await apiClient.get<PaymentResponse>(
      `/payments/booking/${bookingId}`
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching payment:', error);
    return [];
  }
};

// Cancel booking and refund
export const cancelAndRefund = async (
  bookingId: string,
  reason?: string
): Promise<any> => {
  try {
    const response = await apiClient.post(`/payments/cancel/${bookingId}`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling and refunding:', error);
    throw error;
  }
};
