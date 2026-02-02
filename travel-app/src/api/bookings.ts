import apiClient from './client';

export interface Booking {
  id: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'upcoming';
  notes?: string;
  hasReview: boolean;
  travelerAttendance?: boolean | string;
  guideAttendance?: boolean | string;
  guide?: {
    id: string;
    name: string;
    image: string;
    city: string;
    university: string;
    rating: number;
    reviews: number;
    price: number;
  };
  traveler?: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export interface CreateBookingData {
  travelerId: string;
  guideId: string;
  bookingDate: string;
  bookingTime: string;
  duration: 'HALF_DAY' | 'FULL_DAY';
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking | Booking[];
  count?: number;
  message?: string;
}

// Yeni booking oluştur
export const createBooking = async (data: CreateBookingData): Promise<Booking | null> => {
  try {
    const response = await apiClient.post<BookingResponse>('/bookings', data);
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
};

// Kullanıcının booking'lerini getir
export const getMyBookings = async (userId: string, role: string): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<BookingResponse>(`/bookings/my-bookings?userId=${userId}&role=${role}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

// Tek bir booking getir
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const response = await apiClient.get<BookingResponse>(`/bookings/${id}`);
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

// Booking durumunu güncelle
export const updateBookingStatus = async (
  id: string,
  status: string,
  cancellationReason?: string,
  cancelledBy?: string
): Promise<Booking | null> => {
  try {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}/status`, {
      status,
      cancellationReason,
      cancelledBy,
    });
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return null;
  }
};

// Attendance onayı
export const confirmBookingAttendance = async (id: string): Promise<Booking | null> => {
  try {
    const response = await apiClient.patch<BookingResponse>(`/bookings/${id}/confirm-attendance`);
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error confirming attendance:', error);
    return null;
  }
};

// Booking'i iptal et
export const cancelBooking = async (id: string, reason: string, userId: string): Promise<boolean> => {
  try {
    await apiClient.put(`/bookings/${id}/cancel`, {
      cancellationReason: reason,
      cancelledBy: userId,
    });
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
};

// Guide için calendar verilerini getir
export const getGuideCalendar = async (guideId: string, year: number, month: number): Promise<{
  bookings: Array<{ date: string; time: string; status: string }>;
  unavailable: string[];
}> => {
  try {
    const response = await apiClient.get(`/bookings/guide-calendar?guideId=${guideId}&year=${year}&month=${month}`);
    return response.data.data || { bookings: [], unavailable: [] };
  } catch (error) {
    console.error('Error fetching guide calendar:', error);
    return { bookings: [], unavailable: [] };
  }
};

// Confirm attendance (traveler or guide confirms tour completion or reports no-show)
export const confirmAttendance = async (bookingId: string, status: 'CONFIRMED' | 'NO_SHOW' = 'CONFIRMED'): Promise<{ success: boolean; message: string; bothConfirmed: boolean }> => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/confirm-attendance`, { status });
    return {
      success: true,
      message: response.data.message,
      bothConfirmed: response.data.data.bothConfirmed || false,
    };
  } catch (error: any) {
    console.error('Error confirming attendance:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to report attendance',
      bothConfirmed: false,
    };
  }
};

export const verifyMeetingQR = async (
  bookingId: string, 
  data: { qrData: string; scannerLat: number; scannerLng: number; scannerRole: string }
) => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/verify-qr`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
