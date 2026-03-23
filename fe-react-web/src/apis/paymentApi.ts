import apiClient from './apiClient';

export interface CreateTransactionRequest {
  bikeId: string;
  amount: number;
  notes?: string;
  /** Swagger: e.g. full_payment, deposit */
  transactionType?: string;
  /** Swagger: e.g. vnpay */
  paymentMethod?: string | null;
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

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function unwrapTransactionCreate(
  raw: CreateTransactionResponse | ApiEnvelope<{ id: string; status?: string }>,
): CreateTransactionResponse {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as ApiEnvelope<{ id: string; status?: string }>).data;
    if (inner && typeof inner === 'object' && 'id' in inner) {
      return { data: inner };
    }
  }
  return raw as CreateTransactionResponse;
}

export const createTransaction = async (payload: CreateTransactionRequest) => {
  const res = await apiClient.post<
    CreateTransactionResponse | ApiEnvelope<{ id: string; status?: string }>
  >('/buyer/v1/transactions', payload);
  return unwrapTransactionCreate(res.data);
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

// GET /api/payment/v1/vnpay-return
export const getVnpayReturnResult = async (
  queryString: string,
): Promise<ApiEnvelope<{ status?: string; transactionId?: string }>> => {
  const suffix = queryString.startsWith('?') ? queryString : `?${queryString}`;
  const res = await apiClient.get<
    ApiEnvelope<{ status?: string; transactionId?: string }>
  >(`/payment/v1/vnpay-return${suffix}`);
  return res.data;
};

// POST /api/payment/v1/create-remaining/{depositTransactionId}
export const createRemainingPaymentUrl = async (
  depositTransactionId: string,
) => {
  const res = await apiClient.post<CreatePaymentUrlResponse>(
    `/payment/v1/create-remaining/${depositTransactionId}`,
  );
  return res.data;
};
