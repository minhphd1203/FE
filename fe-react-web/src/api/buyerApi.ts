import apiClient from '../apis/apiClient';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BuyerBike = {
  id: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: number;
  price: number;
  condition?: string;
  mileage?: number;
  color?: string;
  images?: string[];
  image?: string;
  video?: string | null;
  status?: string;
  isVerified?: string;
  inspectionStatus?: string;
  categoryId?: string | null;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
  seller?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    avatar?: string | null;
    createdAt?: string;
  };
  category?: { id?: string; name?: string } | null;
  inspections?: BuyerBikeInspection[];
};

export type BuyerBikeInspection = {
  id?: string;
  status?: string;
  overallCondition?: string;
  frameCondition?: string;
  brakeCondition?: string;
  drivetrainCondition?: string;
  wheelCondition?: string;
  inspectionNote?: string;
  recommendation?: string;
  createdAt?: string;
};

export type BuyerSearchResult = {
  items: BuyerBike[];
  meta?: Partial<PaginatedMeta>;
};

export type BuyerTransaction = {
  id: string;
  bikeId?: string;
  buyerId?: string;
  sellerId?: string;
  amount?: number;
  transactionType?: string;
  remainingBalance?: number;
  status?: string;
  paymentMethod?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  bike?: BuyerBike;
  seller?: BuyerBike['seller'];
};

export type WishlistItem = {
  id: string;
  userId?: string;
  bikeId: string;
  createdAt?: string;
  bike?: BuyerBike;
};

export type BuyerMessage = {
  id?: string;
  sender?: string;
  message?: string;
  content?: string;
  createdAt?: string;
  bikeId?: string;
};

const unwrap = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return ((payload as ApiEnvelope<T>).data ?? []) as T;
  }
  return payload as T;
};

function stripParams(
  params?: Record<string, unknown>,
): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v as string | number;
  }
  return out;
}

function readListEnvelope<T>(raw: unknown): {
  items: T[];
  meta?: Partial<PaginatedMeta>;
} {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const o = raw as ApiEnvelope<T[]> & { meta?: Partial<PaginatedMeta> };
    const data = o.data;
    const items = Array.isArray(data) ? data : [];
    return { items, meta: o.meta };
  }
  return { items: [] };
}

// 1. Recommended bikes for homepage (đọc công khai — không gửi token)
export async function getRecommendedBikes(limit = 10): Promise<BuyerBike[]> {
  const response = await apiClient.get<ApiEnvelope<BuyerBike[]>>(
    '/buyer/v1/bikes/recommended',
    { params: { limit }, skipAuth: true },
  );
  return unwrap<BuyerBike[]>(response.data) || [];
}

// 2. Search bikes with filters (Swagger: brand, model, sortBy, sortOrder, page, limit, …)
export async function searchBikes(params?: {
  keyword?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}): Promise<BuyerSearchResult> {
  const { keyword, ...rest } = params || {};
  const apiParams: Record<string, unknown> = { ...rest };
  if (keyword?.trim()) {
    apiParams.keyword = keyword.trim();
  }
  const response = await apiClient.get<
    ApiEnvelope<BuyerBike[]> & { meta?: Partial<PaginatedMeta> }
  >('/buyer/v1/bikes/search', {
    params: stripParams(apiParams),
    skipAuth: true,
  });
  return readListEnvelope<BuyerBike>(response.data);
}

// 3. Get bike details by ID
export async function getBikeDetails(bikeId: string): Promise<BuyerBike> {
  const response = await apiClient.get<ApiEnvelope<BuyerBike>>(
    `/buyer/v1/bikes/${bikeId}`,
    { skipAuth: true },
  );
  return unwrap<BuyerBike>(response.data);
}

// 4. Get buyer's transactions
export async function getTransactions(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: BuyerTransaction[]; meta?: Partial<PaginatedMeta> }> {
  const response = await apiClient.get<
    ApiEnvelope<BuyerTransaction[]> & { meta?: Partial<PaginatedMeta> }
  >('/buyer/v1/transactions', {
    params: params ? stripParams(params as Record<string, unknown>) : {},
  });
  return readListEnvelope<BuyerTransaction>(response.data);
}

// 5. Cancel a transaction by ID
export async function cancelTransaction(id: string) {
  const response = await apiClient.delete(`/buyer/v1/transactions/${id}`);
  return response.data;
}

// 6. Get wishlist
export async function getWishlist(params?: {
  page?: number;
  limit?: number;
}): Promise<{ items: WishlistItem[]; meta?: Partial<PaginatedMeta> }> {
  const response = await apiClient.get<
    ApiEnvelope<WishlistItem[]> & { meta?: Partial<PaginatedMeta> }
  >('/buyer/v1/wishlist', {
    params: params ? stripParams(params as Record<string, unknown>) : {},
  });
  return readListEnvelope<WishlistItem>(response.data);
}

// 7. Add bike to wishlist
export async function addToWishlist(bikeId: string) {
  const response = await apiClient.post(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 8. Remove bike from wishlist
export async function removeFromWishlist(bikeId: string) {
  const response = await apiClient.delete(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 9. Report violation
export async function reportViolation(data: {
  reportedUserId?: string;
  reportedBikeId?: string;
  reason: string;
  description?: string;
}) {
  const response = await apiClient.post('/buyer/v1/reports', data);
  return response.data;
}

// 10. Review seller
export async function reviewSeller(data: {
  sellerId: string;
  transactionId: string;
  rating: number;
  comment: string;
}) {
  const response = await apiClient.post('/buyer/v1/reviews', data);
  return response.data;
}

// 11. Send message to seller
export async function sendMessageToSeller(
  sellerId: string,
  data: { content: string; bikeId?: string },
) {
  const response = await apiClient.post(`/buyer/v1/messages/${sellerId}`, data);
  return response.data;
}

// 11.5 Get all conversations
export async function getConversations(): Promise<any[]> {
  const response =
    await apiClient.get<ApiEnvelope<any[]>>('/buyer/v1/messages');
  return unwrap<any[]>(response.data) || [];
}

// 12. Get messages with seller
export async function getMessagesWithSeller(
  sellerId: string,
  params?: { bikeId?: string; page?: number; limit?: number },
): Promise<BuyerMessage[]> {
  const response = await apiClient.get<ApiEnvelope<BuyerMessage[]>>(
    `/buyer/v1/messages/${sellerId}`,
    {
      params: params ? stripParams(params as Record<string, unknown>) : {},
    },
  );
  const list = unwrap<BuyerMessage[]>(response.data);
  return Array.isArray(list) ? list : [];
}

// 13. GET /buyer/v1/transactions/:id
export async function getTransactionDetail(transactionId: string) {
  const response = await apiClient.get(
    `/buyer/v1/transactions/${transactionId}`,
  );
  const raw = response.data;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as ApiEnvelope<unknown>).data;
  }
  return raw;
}
