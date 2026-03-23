import apiClient from './apiClient';

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const profileApi = {
  getMyProfile: async (): Promise<ProfileUser> => {
    const response =
      await apiClient.get<ApiResponse<ProfileUser>>('/profile/v1/info');
    return response.data.data;
  },

  upgradeSeller: async (): Promise<ProfileUser> => {
    const response = await apiClient.post<ApiResponse<ProfileUser>>(
      '/profile/v1/upgrade-seller',
    );
    return response.data.data;
  },

  downgradeSeller: async (): Promise<ProfileUser> => {
    const response = await apiClient.post<ApiResponse<ProfileUser>>(
      '/profile/v1/downgrade-seller',
    );
    return response.data.data;
  },

  getProfileByUserId: async (userId: string): Promise<ProfileUser> => {
    const response = await apiClient.get<ApiResponse<ProfileUser>>(
      `/profile/v1/${userId}`,
    );
    return response.data.data;
  },
};

// Legacy paths (baseURL không gồm /api sẵn — tránh dùng)
export const getCurrentUserProfile = async () => {
  const res = await apiClient.get('/api/profile/v1/info');
  return res.data;
};

export const upgradeToSeller = async () => {
  const res = await apiClient.post('/api/profile/v1/upgrade-seller');
  return res.data;
};

export const downgradeToBuyer = async () => {
  const res = await apiClient.post('/api/profile/v1/downgrade-seller');
  return res.data;
};

export const getUserProfile = async (userId: string) => {
  const res = await apiClient.get(`/api/profile/v1/${userId}`);
  return res.data;
};
