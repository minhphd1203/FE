import apiClient from './apiClient';

export interface CreateTransactionRequest {
  bikeId: string;
  amount: number;
  notes?: string;
}

export interface CreateTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

export interface CreatePaymentUrlResponse {
  data: {
    paymentUrl: string;
    transactionId: string;
    amount: number;
    orderInfo: string;
  };
}

export interface PaymentStatusResponse {
  data: {
    status: string;
    paymentMethod: string;
  };
}

export const createTransaction = async (payload: CreateTransactionRequest) => {
  const res = await apiClient.post<CreateTransactionResponse>(
    '/buyer/v1/transactions',
    payload,
  );
  return res.data;
};

export const createPaymentUrl = async (transactionId: string) => {
  const res = await apiClient.post<CreatePaymentUrlResponse>(
    `/payment/v1/create/${transactionId}`,
  );
  return res.data;
};

export const getPaymentStatus = async (transactionId: string) => {
  const res = await apiClient.get<PaymentStatusResponse>(
    `/payment/v1/status/${transactionId}`,
  );
  return res.data;
};
