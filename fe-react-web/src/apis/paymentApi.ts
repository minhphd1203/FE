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

/** Payload trong `data` sau POST create / create-remaining (VNPay + QR base64). */
export type PaymentCreateData = {
  paymentUrl: string;
  transactionId: string;
  amount: number;
  orderInfo: string;
  /** Data URL PNG — backend encode đúng `paymentUrl` */
  qrCode?: string | null;
  /** ISO datetime — QR/link thường ~10 phút */
  expiresAt?: string | null;
};

export interface CreatePaymentUrlResponse {
  data: PaymentCreateData;
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

/** Chuẩn hoá `{ success, data }` hoặc body đã là `data` phẳng. */
function unwrapPaymentCreateResponse(raw: unknown): CreatePaymentUrlResponse {
  if (!raw || typeof raw !== 'object') {
    return raw as CreatePaymentUrlResponse;
  }
  const o = raw as Record<string, unknown>;
  if (
    'paymentUrl' in o &&
    typeof (o as PaymentCreateData).paymentUrl === 'string'
  ) {
    return { data: o as PaymentCreateData };
  }
  if ('data' in o && o.data && typeof o.data === 'object') {
    const inner = o.data as PaymentCreateData;
    if (inner.paymentUrl) {
      return { data: inner };
    }
  }
  return raw as CreatePaymentUrlResponse;
}

function unwrapTransactionCreate(
  raw: CreateTransactionResponse | ApiEnvelope<{ id: string; status?: string }>,
): CreateTransactionResponse {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as ApiEnvelope<{ id: string; status?: string }>).data;
    if (inner && typeof inner === 'object' && 'id' in inner) {
      return { data: inner as { id: string; status: string } };
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

export const createPaymentUrl = async (
  transactionId: string,
  payload?: { bankCode?: string; language?: string },
) => {
  const res = await apiClient.post<unknown>(
    `/payment/v1/create/${transactionId}`,
    payload || {},
  );
  return unwrapPaymentCreateResponse(res.data);
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
  payload?: { bankCode?: string; language?: string },
) => {
  const res = await apiClient.post<unknown>(
    `/payment/v1/create-remaining/${depositTransactionId}`,
    payload || {},
  );
  return unwrapPaymentCreateResponse(res.data);
};
