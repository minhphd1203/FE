export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'inspector' | 'customer' | 'seller';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Bicycle {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  type: 'road' | 'mountain' | 'hybrid' | 'electric' | 'folding' | 'other';
  frameSize?: string;
  year?: number;
  images: string[];
  sellerId: string;
  seller: User;
  status: 'active' | 'sold' | 'inactive';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
