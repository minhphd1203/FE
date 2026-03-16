import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string; // admin | buyer | inspector | seller
  };
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { token: string; user: AuthResponse['user'] };
      message?: string;
    }>('/auth/login', credentials);
    const { data } = response.data;
    if (!data?.token || !data?.user) {
      throw new Error(response.data.message || 'Đăng nhập thất bại');
    }
    return { token: data.token, user: data.user };
  },

  register: async (payload: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { token: string; user: AuthResponse['user'] };
      message?: string;
    }>('/auth/register', payload);
    const { data } = response.data;
    if (!data?.token || !data?.user) {
      throw new Error(response.data.message || 'Đăng ký tài khoản thất bại');
    }
    return { token: data.token, user: data.user };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
