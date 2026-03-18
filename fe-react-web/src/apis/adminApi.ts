export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface AdminTransaction {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  bike?: {
    id: string;
    title: string;
    price: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface AdminReport {
  id: string;
  status: 'pending' | 'resolved' | 'closed';
  reason: string;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
  };
  reportedBike?: {
    id: string;
    title: string;
  };
  resolver?: {
    id: string;
    name: string;
  };
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

  /** GET /api/admin/v1/transaction - Lấy danh sách giao dịch */
  getTransactions: async (params?: {
    status?: 'pending' | 'completed' | 'cancelled';
    sort?: 'newest' | 'oldest';
  }): Promise<ApiResponse<AdminTransaction[]>> => {
    const { data } = await apiClient.get<ApiResponse<AdminTransaction[]>>(
      '/admin/v1/transaction',
      { params },
    );
    return data;
  },

  /** PUT /api/admin/v1/transaction/:id - Cập nhật trạng thái giao dịch */
  updateTransaction: async (
    transactionId: string,
    body: { status?: 'pending' | 'completed' | 'cancelled'; notes?: string },
  ): Promise<ApiResponse<AdminTransaction>> => {
    const { data } = await apiClient.put<ApiResponse<AdminTransaction>>(
      `/admin/v1/transaction/${transactionId}`,
      body,
    );
    return data;
  },

  /** GET /api/admin/v1/report - Lấy danh sách báo cáo */
  getReports: async (params?: {
    status?: 'pending' | 'resolved' | 'closed';
  }): Promise<ApiResponse<AdminReport[]>> => {
    const { data } = await apiClient.get<ApiResponse<AdminReport[]>>(
      '/admin/v1/report',
      { params },
    );
    return data;
  },

  /** POST /api/admin/v1/report/:id/resolve - Giải quyết báo cáo */
  resolveReport: async (
    reportId: string,
    body: { resolution: string; status?: 'resolved' | 'closed' },
  ): Promise<ApiResponse<AdminReport>> => {
    const { data } = await apiClient.post<ApiResponse<AdminReport>>(
      `/admin/v1/report/${reportId}/resolve`,
      body,
    );
    return data;
  },
  /** CATEGORY MANAGEMENT */
  /** GET /api/admin/v1/category - Lấy danh sách danh mục xe */
  getCategories: async (): Promise<ApiResponse<AdminCategory[]>> => {
    const { data } =
      await apiClient.get<ApiResponse<AdminCategory[]>>('/admin/v1/category');
    return data;
  },

  /** POST /api/admin/v1/category - Tạo mới danh mục xe */
  createCategory: async (body: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<ApiResponse<AdminCategory>> => {
    const { data } = await apiClient.post<ApiResponse<AdminCategory>>(
      '/admin/v1/category',
      body,
    );
    return data;
  },

  /** PUT /api/admin/v1/category/:id - Cập nhật danh mục xe */
  updateCategory: async (
    id: string,
    body: { name?: string; slug?: string; description?: string },
  ): Promise<ApiResponse<AdminCategory>> => {
    const { data } = await apiClient.put<ApiResponse<AdminCategory>>(
      `/admin/v1/category/${id}`,
      body,
    );
    return data;
  },

  /** DELETE /api/admin/v1/category/:id - Xóa danh mục xe */
  deleteCategory: async (id: string): Promise<ApiResponse<AdminCategory>> => {
    const { data } = await apiClient.delete<ApiResponse<AdminCategory>>(
      `/admin/v1/category/${id}`,
    );
    return data;
  },
};
