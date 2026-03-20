import apiClient from '../apis/apiClient';

// ============= VNPAY PAYMENT =============

// Create VNPay payment URL for a transaction
export async function createPaymentUrl(transactionId: string) {
  const response = await apiClient.post(`/payment/v1/create/${transactionId}`);
  return response.data;
}

// Get payment status
export async function getPaymentStatus(transactionId: string) {
  const response = await apiClient.get(`/payment/v1/status/${transactionId}`);
  return response.data;
}

// Handle VNPay return (note: this is called by frontend after redirect from VNPay)
export async function handleVNPayReturn(queryParams: any) {
  // This function is usually handled on frontend by reading URL query params
  // The actual update is done via IPN callback on backend
  return {
    success: queryParams.vnp_ResponseCode === '00',
    transactionId: queryParams.vnp_TxnRef,
    amount: parseInt(queryParams.vnp_Amount) / 100,
    bankCode: queryParams.vnp_BankCode,
    payDate: queryParams.vnp_PayDate,
    transactionNo: queryParams.vnp_TransactionNo,
  };
}
