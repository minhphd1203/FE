// src/api/bikeApi.ts
import axios from 'axios';

export interface SearchBikesParams {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export async function searchBikes(params: SearchBikesParams) {
  const response = await axios.get('/api/buyer/v1/bikes/search', {
    params,
    // Nếu cần token, thêm headers ở đây
    // headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
