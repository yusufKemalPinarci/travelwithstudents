import apiClient from './client';
import type { Guide } from '../types';

export interface GuideFilters {
  city?: string;
  minRating?: number;
  maxPrice?: number;
  tags?: string;
  search?: string;
  date?: string;
}

export interface GuideResponse {
  success: boolean;
  count: number;
  data: Guide[];
}

export interface SingleGuideResponse {
  success: boolean;
  data: Guide;
}

// Tüm guide'ları getir
export const getAllGuides = async (filters?: GuideFilters): Promise<Guide[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.city) params.append('city', filters.city);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.tags) params.append('tags', filters.tags);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date) params.append('date', filters.date);

    const response = await apiClient.get<GuideResponse>(`/guides?${params.toString()}`);
    // Map backend response to frontend Guide type
    const guides = response.data.data.map((guide: any) => ({
      ...guide,
      isStudentVerified: guide.verified,
    }));
    return guides;
  } catch (error) {
    console.error('Error fetching guides:', error);
    return []; // Hata durumunda boş array dön
  }
};

// Tek bir guide getir
export const getGuideById = async (id: string): Promise<Guide | null> => {
  try {
    const response = await apiClient.get<SingleGuideResponse>(`/guides/${id}`);
    const guide = response.data.data;
    // Map backend response to frontend Guide type
    return {
      ...guide,
      isStudentVerified: (guide as any).verified,
    };
  } catch (error) {
    console.error('Error fetching guide:', error);
    return null;
  }
};

// Şehre göre guide'ları getir
export const getGuidesByCity = async (city: string): Promise<Guide[]> => {
  try {
    const response = await apiClient.get<GuideResponse>(`/guides/city/${city}`);
    // Map backend response to frontend Guide type
    const guides = response.data.data.map((guide: any) => ({
      ...guide,
      isStudentVerified: guide.verified,
    }));
    return guides;
  } catch (error) {
    console.error('Error fetching guides by city:', error);
    return [];
  }
};

// Guide profilini güncelle
export const updateGuideProfile = async (guideId: string, data: Partial<Guide> | any): Promise<Guide | null> => {
    try {
        const response = await apiClient.put<SingleGuideResponse>(`/guides/${guideId}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating guide profile:', error);
        return null;
    }
};

export const uploadGuideGallery = async (guideId: string, files: File[]): Promise<string[] | null> => {
    try {
        const formData = new FormData();
        files.forEach(file => formData.append('gallery', file));

        // Let browser set content-type
        const response = await apiClient.put<{ success: boolean; data: string[] }>(`/guides/${guideId}/gallery`, formData);
        return response.data.data;
    } catch (error) {
        console.error('Error uploading gallery:', error);
        return null;
    }
};

export const deleteGuideGalleryImage = async (guideId: string, imageUrl: string): Promise<string[] | null> => {
    try {
        const guide = await getGuideById(guideId);
        if (!guide) return null;
        
        const currentGallery = (guide as any).gallery || [];
        const newGallery = currentGallery.filter((img: string) => img !== imageUrl);
        
        await updateGuideProfile(guideId, { gallery: newGallery });
        return newGallery;
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return null;
    }
};

export const getGuideAvailability = async (guideId: string | number): Promise<any[]> => {
    try {
        const response = await apiClient.get(`/guides/${guideId}/availability`);
        return response.data.data || response.data || [];
    } catch (error) {
        console.error('Error fetching guide availability:', error);
        return [];
    }
};
