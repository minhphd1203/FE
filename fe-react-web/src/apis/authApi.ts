import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'buyer' | 'seller';
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'buyer' | 'seller';
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

  register: async (payload: RegisterData): Promise<void> => {
    // Nhiều backend chỉ trả 201 + message, không trả token/user.
    // Với flow hiện tại: đăng ký xong chuyển sang trang đăng nhập,
    // nên chỉ cần request thành công là đủ.
    await apiClient.post('/auth/register', payload);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<
      | { success: boolean; data: AuthResponse['user']; message?: string }
      | AuthResponse['user']
    >('/auth/me');
    const raw = response.data;
    if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
      return raw.data as AuthResponse['user'];
    }
    return raw as AuthResponse['user'];
  },
};
