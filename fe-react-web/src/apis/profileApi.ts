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
  // GET /api/profile/v1/info
  getMyProfile: async (): Promise<ProfileUser> => {
    const response =
      await apiClient.get<ApiResponse<ProfileUser>>('/profile/v1/info');
    return response.data.data;
  },

  // POST /api/profile/v1/upgrade-seller
  upgradeSeller: async (): Promise<ProfileUser> => {
    const response = await apiClient.post<ApiResponse<ProfileUser>>(
      '/profile/v1/upgrade-seller',
    );
    return response.data.data;
  },

  // POST /api/profile/v1/downgrade-seller
  downgradeSeller: async (): Promise<ProfileUser> => {
    const response = await apiClient.post<ApiResponse<ProfileUser>>(
      '/profile/v1/downgrade-seller',
    );
    return response.data.data;
  },

  // GET /api/profile/v1/{userId}
  getProfileByUserId: async (userId: string): Promise<ProfileUser> => {
    const response = await apiClient.get<ApiResponse<ProfileUser>>(
      `/profile/v1/${userId}`,
    );
    return response.data.data;
  },
};

// Profile APIs (legacy paths — ưu tiên dùng profileApi ở trên với baseURL)
export const getCurrentUserProfile = async () => {
  const res = await apiClient.get('/api/profile/v1/info');
  return res.data;
};

export const updateUserProfile = async (userData: {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}) => {
  const res = await apiClient.put('/api/profile/v1/info', userData);
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

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  const res = await apiClient.post('/api/profile/v1/change-password', {
    oldPassword,
    newPassword,
  });
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/api/profile/v1/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
