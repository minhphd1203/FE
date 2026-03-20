import apiClient from './apiClient';

// Seller APIs
export const postBike = async (bikeData: any) => {
  const res = await apiClient.post('/seller/v1/bikes', bikeData);
  return res.data;
};

export const getMyBikes = async (page: number = 1, limit: number = 10) => {
  const res = await apiClient.get(
    `/seller/v1/bikes?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const getBikeDetail = async (bikeId: string) => {
  const res = await apiClient.get(`/seller/v1/bikes/${bikeId}`);
  return res.data;
};

export const updateBike = async (bikeId: string, bikeData: any) => {
  const res = await apiClient.put(`/seller/v1/bikes/${bikeId}`, bikeData);
  return res.data;
};

export const deleteBike = async (bikeId: string) => {
  const res = await apiClient.delete(`/seller/v1/bikes/${bikeId}`);
  return res.data;
};

export const getMyOffers = async (page: number = 1, limit: number = 10) => {
  const res = await apiClient.get(
    `/seller/v1/offers?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const respondToOffer = async (
  offerId: string,
  action: 'accept' | 'reject',
  counterOffer?: number,
) => {
  const res = await apiClient.post(`/seller/v1/offers/${offerId}/respond`, {
    action,
    counterOffer,
  });
  return res.data;
};

export const getMyTransactions = async (
  page: number = 1,
  limit: number = 10,
) => {
  const res = await apiClient.get(
    `/seller/v1/transactions?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const getTransactionDetail = async (transactionId: string) => {
  const res = await apiClient.get(`/seller/v1/transactions/${transactionId}`);
  return res.data;
};

export const getMyDashboard = async () => {
  const res = await apiClient.get('/seller/v1/dashboard');
  return res.data;
};

export const getSalesStats = async () => {
  const res = await apiClient.get('/seller/v1/stats/sales');
  return res.data;
};
