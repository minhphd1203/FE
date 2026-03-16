import apiClient from './apiClient';

/** BE response wrapper */
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/** User từ BE */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/** Bike từ BE (có seller nested) */
export interface AdminBike {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  sellerId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  category?: { id: string; name: string };
}

/** Query params cho getBikes */
export interface GetBikesParams {
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  sort?: 'newest' | 'oldest';
}

/** Query params cho getUsers */
export interface GetUsersParams {
  search?: string;
  role?: string;
}

export const adminApi = {
  /** GET /api/admin/v1/bike - Lấy danh sách xe đạp */
  getBikes: async (
    params?: GetBikesParams,
  ): Promise<ApiResponse<AdminBike[]>> => {
    const { data } = await apiClient.get<ApiResponse<AdminBike[]>>(
      '/admin/v1/bike',
      { params },
    );
    return data;
  },

  /** PUT /api/admin/v1/bike/:id/approve - Duyệt tin đăng */
  approveBike: async (bikeId: string): Promise<ApiResponse<AdminBike>> => {
    const { data } = await apiClient.put<ApiResponse<AdminBike>>(
      `/admin/v1/bike/${bikeId}/approve`,
    );
    return data;
  },

  /** PUT /api/admin/v1/bike/:id/reject - Từ chối tin đăng */
  rejectBike: async (
    bikeId: string,
    reason?: string,
  ): Promise<ApiResponse<AdminBike>> => {
    const { data } = await apiClient.put<ApiResponse<AdminBike>>(
      `/admin/v1/bike/${bikeId}/reject`,
      { reason },
    );
    return data;
  },

  /** DELETE /api/admin/v1/bike/:id - Xóa tin đăng */
  deleteBike: async (bikeId: string): Promise<ApiResponse<AdminBike>> => {
    const { data } = await apiClient.delete<ApiResponse<AdminBike>>(
      `/admin/v1/bike/${bikeId}`,
    );
    return data;
  },

  /** GET /api/admin/v1/user - Lấy danh sách người dùng */
  getUsers: async (
    params?: GetUsersParams,
  ): Promise<ApiResponse<AdminUser[]>> => {
    const { data } = await apiClient.get<ApiResponse<AdminUser[]>>(
      '/admin/v1/user',
      { params },
    );
    return data;
  },

  /** PUT /api/admin/v1/user/:id - Cập nhật người dùng */
  updateUser: async (
    userId: string,
    body: { name?: string; phone?: string; role?: string },
  ): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.put<ApiResponse<AdminUser>>(
      `/admin/v1/user/${userId}`,
      body,
    );
    return data;
  },

  /** DELETE /api/admin/v1/user/:id - Xóa người dùng */
  deleteUser: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.delete<ApiResponse<AdminUser>>(
      `/admin/v1/user/${userId}`,
    );
    return data;
  },
};
