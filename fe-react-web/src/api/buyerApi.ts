import apiClient from '../apis/apiClient';

// 1. Search bikes with filters
export async function searchBikes(params) {
  const response = await apiClient.get('/buyer/v1/bikes/search', { params });
  return response.data;
}

// 2. Get bike details by ID
export async function getBikeDetails(bikeId) {
  const response = await apiClient.get(`/buyer/v1/bikes/${bikeId}`);
  return response.data;
}

// 3. Create a transaction (buy a bike)
export async function createTransaction(data) {
  const response = await apiClient.post('/buyer/v1/transactions', data);
  return response.data;
}

// 4. Get buyer's transactions
export async function getTransactions() {
  const response = await apiClient.get('/buyer/v1/transactions');
  return response.data;
}

// 5. Cancel a transaction by ID
export async function cancelTransaction(id) {
  const response = await apiClient.delete(`/buyer/v1/transactions/${id}`);
  return response.data;
}

// 6. Get wishlist
export async function getWishlist() {
  const response = await apiClient.get('/buyer/v1/wishlist');
  return response.data;
}

// 7. Add bike to wishlist
export async function addToWishlist(bikeId) {
  const response = await apiClient.post(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 8. Remove bike from wishlist
export async function removeFromWishlist(bikeId) {
  const response = await apiClient.delete(`/buyer/v1/wishlist/${bikeId}`);
  return response.data;
}

// 9. Report violation
export async function reportViolation(data) {
  const response = await apiClient.post('/buyer/v1/reports', data);
  return response.data;
}

// 10. Review seller
export async function reviewSeller(data) {
  const response = await apiClient.post('/buyer/v1/reviews', data);
  return response.data;
}

// 11. Send message to seller
export async function sendMessageToSeller(sellerId, data) {
  const response = await apiClient.post(`/buyer/v1/messages/${sellerId}`, data);
  return response.data;
}

// 12. Get messages with seller
export async function getMessagesWithSeller(sellerId) {
  const response = await apiClient.get(`/buyer/v1/messages/${sellerId}`);
  return response.data;
}
