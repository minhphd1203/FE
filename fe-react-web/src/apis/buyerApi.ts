import apiClient from './apiClient';

// Buyer APIs
export const getRecommendedBikes = async (limit: number = 5) => {
  const res = await apiClient.get(`/buyer/v1/bikes/recommended?limit=${limit}`);
  return res.data;
};

export const searchBikes = async (params: {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await apiClient.get('/buyer/v1/bikes/search', { params });
  return res.data;
};

export const getBikeDetail = async (bikeId: string) => {
  const res = await apiClient.get(`/buyer/v1/bikes/${bikeId}`);
  return res.data;
};

export const getMyOffers = async (page: number = 1, limit: number = 10) => {
  const res = await apiClient.get(
    `/buyer/v1/offers?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const makeOffer = async (bikeId: string, offerPrice: number) => {
  const res = await apiClient.post(`/buyer/v1/offers`, {
    bikeId,
    offerPrice,
  });
  return res.data;
};

export const updateOffer = async (offerId: string, offerPrice: number) => {
  const res = await apiClient.put(`/buyer/v1/offers/${offerId}`, {
    offerPrice,
  });
  return res.data;
};

export const requestInspection = async (bikeId: string) => {
  const res = await apiClient.post(
    `/buyer/v1/bikes/${bikeId}/request-inspection`,
  );
  return res.data;
};

export const getMyTransactions = async (
  page: number = 1,
  limit: number = 10,
) => {
  const res = await apiClient.get(
    `/buyer/v1/transactions?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const getTransactionDetail = async (transactionId: string) => {
  const res = await apiClient.get(`/buyer/v1/transactions/${transactionId}`);
  return res.data;
};

export const getMyWishlist = async () => {
  const res = await apiClient.get('/buyer/v1/wishlist');
  return res.data;
};

export const addToWishlist = async (bikeId: string) => {
  const res = await apiClient.post('/buyer/v1/wishlist', { bikeId });
  return res.data;
};

export const removeFromWishlist = async (bikeId: string) => {
  const res = await apiClient.delete(`/buyer/v1/wishlist/${bikeId}`);
  return res.data;
};
