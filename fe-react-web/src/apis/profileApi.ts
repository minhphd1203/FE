import apiClient from './apiClient';

// Profile APIs
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
