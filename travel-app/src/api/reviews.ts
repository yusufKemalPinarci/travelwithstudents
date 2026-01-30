import apiClient from './client';

export interface Review {
  id: string;
  bookingId: string;
  guideId: string;
  travelerId: string;
  rating: number;
  comment: string;
  tags: string[];
  isPublic: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  traveler?: {
    name: string;
    profileImage: string;
  };
}

export interface CreateReviewData {
  bookingId: string;
  guideId: string;
  travelerId: string;
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface ReviewResponse {
  success: boolean;
  data: Review | Review[];
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  message?: string;
}

// Review oluştur
export const createReview = async (data: CreateReviewData): Promise<Review | null> => {
  try {
    const response = await apiClient.post<ReviewResponse>('/reviews', data);
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
};

// Guide'ın tüm review'larını getir
export const getGuideReviews = async (
  guideId: string,
  limit = 10,
  page = 1
): Promise<{ reviews: Review[]; total: number; totalPages: number }> => {
  try {
    const response = await apiClient.get<ReviewResponse>(
      `/reviews/guide/${guideId}?limit=${limit}&page=${page}`
    );
    return {
      reviews: Array.isArray(response.data.data) ? response.data.data : [],
      total: response.data.total || 0,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], total: 0, totalPages: 1 };
  }
};

// Review güncelle
export const updateReview = async (
  id: string,
  data: { rating?: number; comment?: string; tags?: string[] }
): Promise<Review | null> => {
  try {
    const response = await apiClient.put<ReviewResponse>(`/reviews/${id}`, data);
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error updating review:', error);
    return null;
  }
};

// Review sil
export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/reviews/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};

// Review'a cevap ver
export const replyToReview = async (id: string, responseText: string): Promise<Review | null> => {
  try {
    const response = await apiClient.post<ReviewResponse>(`/reviews/${id}/reply`, { response: responseText });
    return Array.isArray(response.data.data) ? null : response.data.data;
  } catch (error) {
    console.error('Error replying to review:', error);
    return null;
  }
};
