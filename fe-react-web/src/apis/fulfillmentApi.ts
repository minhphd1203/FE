import apiClient from './apiClient';

/** GET /api/fulfillment/v1/transactions/{id} */
export interface FulfillmentDetailResponse {
  success: boolean;
  data: {
    id: string;
    bikeId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    transactionType: 'full_payment' | 'deposit' | 'remaining_payment';
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    deliveryStatus: 'preparing' | 'delivering' | 'delivered' | null;
    deliveryNotes: string | null;
    deliveryUpdatedAt: string | null;
    createdAt: string;
    address?: string | null;
    shippingAddress?: string | null;
    fullName?: string | null;
    bike: {
      id: string;
      title: string;
      images: string[];
      price: number;
    };
    buyer: {
      id: string;
      name: string;
      fullName?: string;
      phone?: string;
    };
    seller: {
      id: string;
      name: string;
      phone?: string;
    };
  };
  message?: string;
}

export async function getFulfillmentDetail(
  transactionId: string,
): Promise<FulfillmentDetailResponse> {
  const res = await apiClient.get<FulfillmentDetailResponse>(
    `/fulfillment/v1/transactions/${transactionId}`,
  );
  return res.data;
}

/** PATCH /api/fulfillment/v1/transactions/{id}/delivery */
export interface UpdateDeliveryStatusBody {
  status: 'preparing' | 'delivering' | 'delivered';
  deliveryNotes?: string | null;
}

export async function updateDeliveryStatus(
  transactionId: string,
  body: UpdateDeliveryStatusBody,
): Promise<{ success: boolean; message?: string }> {
  const res = await apiClient.patch(
    `/fulfillment/v1/transactions/${transactionId}/delivery`,
    body,
  );
  return res.data;
}

/** POST /api/fulfillment/v1/transactions/{id}/confirm-receipt */
export async function confirmReceipt(
  transactionId: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await apiClient.post(
    `/fulfillment/v1/transactions/${transactionId}/confirm-receipt`,
  );
  return res.data;
}
