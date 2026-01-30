import apiClient from './client';
import type { AxiosProgressEvent } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TRAVELER' | 'STUDENT_GUIDE' | 'ADMIN';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string;
  gender?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  lastLoginAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'TRAVELER' | 'STUDENT_GUIDE';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: User;
}

// Kullanıcı kaydı
export const register = async (data: RegisterData): Promise<AuthResponse['data'] | null> => {
  try {
    const response = await apiClient.post<AuthResponse>('/users/register', data);
    
    // Token'ı localStorage'a kaydet
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

// Kullanıcı girişi
export const login = async (data: LoginData): Promise<AuthResponse['data'] | null> => {
  try {
    const response = await apiClient.post<AuthResponse>('/users/login', data);
    
    // Token'ı localStorage'a kaydet
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Google ile giriş
export const googleLogin = async (data: GoogleLoginData): Promise<AuthResponse['data'] | null> => {
  try {
    const response = await apiClient.post<AuthResponse>('/users/google', data);
    
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error during Google login:', error);
    return null;
  }
};

// Kullanıcı profilini getir
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const response = await apiClient.get<UserProfileResponse>(`/users/profile/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Kullanıcı profilini güncelle
export const updateUserProfile = async (
  userId: string, 
  data: Partial<User> | FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<User | null> => {
  try {
    const config = onUploadProgress ? {
      onUploadProgress
    } : {};
    
    const response = await apiClient.put<UserProfileResponse>(`/users/profile/${userId}`, data, config); 
    return response.data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Çıkış yap
export const logout = (): void => {
  localStorage.removeItem('authToken');
};

export const updateProfileImage = async (file: File, onProgress?: (progress: number) => void): Promise<{ profileImage: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await apiClient.post('/users/profile-image', formData, {
    onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) { // Use any for progressEvent if needed
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
        }
    }
  });

  return response.data;
};


