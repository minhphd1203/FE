import apiClient from '../apis/apiClient';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export type BuyerBike = {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  image?: string;
  seller?: {
    id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  status?: string;
};

const unwrap = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return ((payload as ApiEnvelope<T>).data ?? []) as T;
  }
  return payload as T;
};

// 1. Recommended bikes for homepage
export async function getRecommendedBikes(limit = 10): Promise<BuyerBike[]> {
  const response = await apiClient.get<ApiEnvelope<BuyerBike[]>>(
    '/buyer/v1/bikes/recommended',
    { params: { limit } },
  );
  return unwrap<BuyerBike[]>(response.data) || [];
}

// 2. Search bikes with filters
export async function searchBikes(params?: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  page?: number;
  limit?: number;
}): Promise<BuyerBike[]> {
  const response = await apiClient.get<ApiEnvelope<BuyerBike[]>>(
    '/buyer/v1/bikes/search',
    { params },
  );
  return unwrap<BuyerBike[]>(response.data) || [];
}

// 3. Get bike details by ID
export async function getBikeDetails(bikeId: string): Promise<BuyerBike> {
  const response = await apiClient.get<ApiEnvelope<BuyerBike>>(
    `/buyer/v1/bikes/${bikeId}`,
  );
  return unwrap<BuyerBike>(response.data);
}

// 4. Create a transaction (buy a bike)
export async function createTransaction(data: {
  bikeId: string;
  amount: string | number;
}) {
  const response = await apiClient.post('/buyer/v1/transactions', data);
  return response.data;
}

// 5. Get buyer's transactions
export async function getTransactions() {
  const response = await apiClient.get('/buyer/v1/transactions');
  return unwrap<any[]>(response.data) || [];
}

// 6. Cancel a transaction by ID
export async function cancelTransaction(id: string) {
  const response = await apiClient.delete(`/buyer/v1/transactions/${id}`);
  return response.data;
}

// 7. Get wishlist
export async function getWishlist() {
  const response = await apiClient.get('/buyer/v1/wishlist');
  return unwrap<any[]>(response.data) || [];
}

// 8. Add bike to wishlist
export async function addToWishlist(bikeId: string) {
  const response = await apiClient.post(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 9. Remove bike from wishlist
export async function removeFromWishlist(bikeId: string) {
  const response = await apiClient.delete(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 10. Report violation
export async function reportViolation(data: {
  reason: string;
  details?: string;
}) {
  const response = await apiClient.post('/buyer/v1/reports', data);
  return response.data;
}

// 11. Review seller
export async function reviewSeller(data: {
  sellerId: string;
  rating: number;
  comment: string;
}) {
  const response = await apiClient.post('/buyer/v1/reviews', data);
  return response.data;
}

// 12. Send message to seller
export async function sendMessageToSeller(
  sellerId: string,
  data: { message: string },
) {
  const response = await apiClient.post(`/buyer/v1/messages/${sellerId}`, data);
  return response.data;
}

// 13. Get messages with seller
export async function getMessagesWithSeller(sellerId: string) {
  const response = await apiClient.get(`/buyer/v1/messages/${sellerId}`);
  return unwrap<any[]>(response.data) || [];
}
