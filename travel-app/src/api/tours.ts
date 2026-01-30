import apiClient from './client';

export interface Tour {
  id: string;
  guideId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;
  price: number;
  language: string;
  photos: string[];
  isActive: boolean;
  tourDate?: string;
  tourTime?: string;
  maxParticipants: number;
  availableSlots: number;
  createdAt: string;
  guide: {
    id: number;
    user: {
      name: string;
      profileImage: string | null;
    };
  };
}

export const getAllTours = async (params?: any): Promise<Tour[]> => {
  const response = await apiClient.get('/tours', { params });
  return response.data;
};

export const getTourById = async (id: string): Promise<Tour> => {
  const response = await apiClient.get(`/tours/${id}`);
  return response.data;
};

export const getGuideTours = async (guideId: string): Promise<Tour[]> => {
  const response = await apiClient.get(`/tours/guide/${guideId}`);
  return response.data;
};

export const createTour = async (tourData: any) => {
  const response = await apiClient.post('/tours', tourData);
  return response.data;
};

export const updateTour = async (tourId: string, tourData: any) => {
  const response = await apiClient.put(`/tours/${tourId}`, tourData);
  return response.data;
};

export const deleteTour = async (tourId: string) => {
  const response = await apiClient.delete(`/tours/${tourId}`);
  return response.data;
};
