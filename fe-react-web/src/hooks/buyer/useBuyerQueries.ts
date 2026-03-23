import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToWishlist,
  cancelTransaction,
  getBikeDetails,
  getMessagesWithSeller,
  getRecommendedBikes,
  getTransactions,
  getWishlist,
  removeFromWishlist,
  reportViolation,
  reviewSeller,
  searchBikes,
  sendMessageToSeller,
  type BuyerBike,
} from '../../api/buyerApi';
import {
  createPaymentUrl,
  createRemainingPaymentUrl,
  createTransaction,
  getPaymentStatus,
  getVnpayReturnResult,
} from '../../apis/paymentApi';
import { queryKeys } from '../query-keys';

export function useBuyerRecommendedBikesQuery(limit = 10) {
  return useQuery({
    queryKey: queryKeys.buyer.recommended(limit),
    queryFn: () => getRecommendedBikes(limit),
  });
}

export function useBuyerSearchBikesQuery(params: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.buyer.search(params as Record<string, unknown>),
    queryFn: () => searchBikes(params),
  });
}

export function useBuyerBikeDetailsQuery(bikeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.buyer.bike(bikeId ?? ''),
    queryFn: () => getBikeDetails(bikeId as string),
    enabled: Boolean(bikeId),
  });
}

export function useBuyerWishlistQuery() {
  return useQuery({
    queryKey: queryKeys.buyer.wishlist(),
    queryFn: async () => {
      const res = await getWishlist();
      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object' && 'data' in res) {
        const d = (res as { data?: unknown }).data;
        return Array.isArray(d) ? d : [];
      }
      return [];
    },
  });
}

export function useBuyerTransactionsQuery() {
  return useQuery({
    queryKey: queryKeys.buyer.transactions(),
    queryFn: async () => {
      const data = await getTransactions();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useBuyerMessagesWithSellerQuery(sellerId: string) {
  const trimmed = sellerId.trim();
  return useQuery({
    queryKey: queryKeys.buyer.messages(trimmed),
    queryFn: () => getMessagesWithSeller(trimmed),
    enabled: false,
  });
}

export function useBuyerAddToWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => addToWishlist(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyer.wishlist() });
    },
  });
}

export function useBuyerRemoveFromWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => removeFromWishlist(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyer.wishlist() });
    },
  });
}

export function useBuyerCancelTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelTransaction(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyer.transactions() });
    },
  });
}

export function useBuyerReportViolationMutation() {
  return useMutation({
    mutationFn: (data: { reason: string; details?: string }) =>
      reportViolation(data),
  });
}

export function useBuyerReviewSellerMutation() {
  return useMutation({
    mutationFn: (data: { sellerId: string; rating: number; comment: string }) =>
      reviewSeller(data),
  });
}

export function useBuyerSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sellerId,
      message,
    }: {
      sellerId: string;
      message: string;
    }) => sendMessageToSeller(sellerId.trim(), { message }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.buyer.messages(variables.sellerId.trim()),
      });
    },
  });
}

export function useBuyerCreateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { bikeId: string; amount: number; notes?: string }) =>
      createTransaction(payload),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyer.transactions() });
    },
  });
}

export function useBuyerCreatePaymentUrlMutation() {
  return useMutation({
    mutationFn: (transactionId: string) => createPaymentUrl(transactionId),
  });
}

export function useBuyerCreateRemainingPaymentUrlMutation() {
  return useMutation({
    mutationFn: (depositTransactionId: string) =>
      createRemainingPaymentUrl(depositTransactionId),
  });
}

export type PaymentVerifyResult = {
  success: boolean;
  message: string;
};

export function useBuyerPaymentVerifyQuery(search: string) {
  return useQuery({
    queryKey: queryKeys.buyer.paymentVerify(search || '_empty'),
    queryFn: async (): Promise<PaymentVerifyResult> => {
      const qs = search || '';
      const query = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
      const transactionId =
        query.get('transactionId') || query.get('vnp_TxnRef') || '';

      try {
        if (qs && query.get('vnp_ResponseCode')) {
          const ret = await getVnpayReturnResult(
            qs.startsWith('?') ? qs : `?${qs}`,
          );
          const status = (ret.data?.status || '').toLowerCase();
          const isOk =
            status.includes('success') ||
            status.includes('paid') ||
            query.get('vnp_ResponseCode') === '00';
          return {
            success: isOk,
            message: isOk
              ? 'Thanh toán thành công! Giao dịch đã được xác nhận.'
              : ret.message || 'Thanh toán chưa thành công.',
          };
        }

        if (transactionId) {
          const statusRes = await getPaymentStatus(transactionId);
          const status = (statusRes.data?.status || '').toLowerCase();
          const isOk = ['success', 'paid', 'completed'].includes(status);
          const isPending = ['pending', 'processing'].includes(status);
          return {
            success: isOk || isPending,
            message: isOk
              ? 'Thanh toán thành công!'
              : isPending
                ? 'Giao dịch đang được xử lý, vui lòng kiểm tra lại sau.'
                : 'Thanh toán chưa thành công.',
          };
        }

        return {
          success: false,
          message: 'Không tìm thấy thông tin giao dịch.',
        };
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Không thể xác minh trạng thái thanh toán.';
        return { success: false, message: msg };
      }
    },
  });
}

export type { BuyerBike };
