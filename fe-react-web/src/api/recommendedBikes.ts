import { Bicycle, ApiResponse } from '../types';

export async function fetchRecommendedBikes(
  limit = 10,
  token?: string,
): Promise<ApiResponse<Bicycle[]>> {
  const res = await fetch(`/api/buyer/v1/bikes/recommended?limit=${limit}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch recommended bikes');
  return res.json();
}
