import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToWishlist,
  cancelTransaction,
  getBikeDetails,
  getCategories,
  getConversations,
  getMessagesWithSeller,
  getRecommendedBikes,
  getTransactionDetail,
  getReportReasons,
  getTransactions,
  getWishlist,
  removeFromWishlist,
  reportViolation,
  reviewSeller,
  searchBikes,
  sendMessageToSeller,
  getMyReports,
  type BuyerBike,
  type BuyerCategory,
  type ReportReason,
  type WishlistItem,
} from '../../api/buyerApi';
import { buildMessageFormData } from '../../utils/messageFormData';
import {
  createPaymentUrl,
  createRemainingPaymentUrl,
  createTransaction,
  getPaymentStatus,
  getVnpayReturnResult,
  refundTransaction,
  type CreateTransactionRequest,
} from '../../apis/paymentApi';
import { getBikeDetail, type SellerBikeDetail } from '../../apis/sellerApi';
import { useAppSelector } from '../../redux/hooks';
import { queryKeys } from '../query-keys';

function mapSellerDetailToBuyerBike(d: SellerBikeDetail): BuyerBike {
  return {
    id: d.id,
    title: d.title,
    description: d.description || undefined,
    price: d.price,
    images: d.images?.length ? d.images : undefined,
    image: d.images?.[0],
    seller: { id: d.sellerId },
    createdAt: d.createdAt,
    status: d.status,
  };
}

export function useBuyerCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.buyer.categories(),
    queryFn: () => getCategories(),
  });
}

export function useBuyerRecommendedBikesQuery(limit = 10) {
  return useQuery({
    queryKey: queryKeys.buyer.recommended(limit),
    queryFn: async () => {
      try {
        return await getRecommendedBikes(limit);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          const { items } = await searchBikes({ page: 1, limit });
          return items;
        }
        throw err;
      }
    },
  });
}

export function useBuyerSearchBikesQuery(
  params: {
    keyword?: string;
    brand?: string;
    model?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.buyer.search(params as Record<string, unknown>),
    queryFn: () => searchBikes(params),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Chi tiết tin: ưu tiên API buyer (tin đã lên chợ).
 * Nếu 404 và user là seller — thử GET seller (tin chờ duyệt / chưa public vẫn xem được).
 */
export function useBuyerBikeDetailsQuery(bikeId: string | undefined) {
  const isSeller =
    useAppSelector((s) => s.auth.user?.role?.toLowerCase()) === 'seller';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const trySellerFallback = isAuthenticated && isSeller;

  return useQuery({
    queryKey: [
      ...queryKeys.buyer.bike(bikeId ?? ''),
      'detail',
      trySellerFallback,
    ] as const,
    queryFn: async () => {
      const id = bikeId as string;
      try {
        return await getBikeDetails(id);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404 && trySellerFallback) {
          const res = await getBikeDetail(id);
          const raw = res?.data;
          if (raw && typeof raw === 'object' && 'id' in raw) {
            return mapSellerDetailToBuyerBike(raw as SellerBikeDetail);
          }
        }
        throw err;
      }
    },
    enabled: Boolean(bikeId),
  });
}

export function useBuyerWishlistQuery(params?: {
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  return useQuery({
    queryKey: queryKeys.buyer.wishlist({ page, limit }),
    queryFn: async (): Promise<WishlistItem[]> => {
      const { items } = await getWishlist({ page, limit });
      return items;
    },
  });
}

export function useBuyerTransactionsQuery(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const status = params?.status;
  return useQuery({
    queryKey: queryKeys.buyer.transactions({ status, page, limit }),
    queryFn: async () => {
      const { items } = await getTransactions({ status, page, limit });
      return items;
    },
  });
}

export function useBuyerConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.buyer.conversations(),
    queryFn: () => getConversations(),
  });
}

export function useBuyerMessagesWithSellerQuery(
  sellerId: string,
  params?: { bikeId?: string; page?: number; limit?: number },
) {
  const trimmed = sellerId.trim();
  const bikeId = params?.bikeId?.trim();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 30;
  return useQuery({
    queryKey: queryKeys.buyer.messages(trimmed, {
      bikeId,
      page,
      limit,
    }),
    queryFn: () => getMessagesWithSeller(trimmed, { bikeId, page, limit }),
    enabled: Boolean(trimmed),
  });
}

export function useBuyerTransactionDetailQuery(
  transactionId: string | undefined,
  options?: { enabled?: boolean },
) {
  const hasId = Boolean(transactionId?.trim());
  const enabled = (options?.enabled ?? true) && hasId;
  return useQuery({
    queryKey: queryKeys.buyer.transaction(transactionId ?? ''),
    queryFn: () => getTransactionDetail(transactionId as string),
    enabled,
  });
}

export function useBuyerAddToWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => addToWishlist(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['buyer', 'wishlist'] });
    },
  });
}

export function useBuyerRemoveFromWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => removeFromWishlist(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['buyer', 'wishlist'] });
    },
  });
}

export function useBuyerCancelTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelTransaction(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['buyer', 'transactions'] });
    },
  });
}

export function useBuyerReportReasonsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.buyer.reportReasons(),
    queryFn: () => getReportReasons(),
    enabled: options?.enabled ?? true,
  });
}

export function useBuyerReportViolationMutation() {
  return useMutation({
    mutationFn: (data: {
      reasonId: string;
      reasonText?: string;
      description: string;
      reportedUserId?: string;
      reportedBikeId?: string;
      transactionId?: string;
    }) => reportViolation(data),
  });
}

export function useBuyerRefundMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      transactionId: string;
      reason?: string;
      reportId?: string;
    }) =>
      refundTransaction(data.transactionId, {
        reason: data.reason,
        reportId: data.reportId,
      }),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['buyer', 'transactions'] });
    },
  });
}

export function useBuyerReviewSellerMutation() {
  return useMutation({
    mutationFn: (data: {
      sellerId: string;
      transactionId: string;
      rating: number;
      comment: string;
    }) => reviewSeller(data),
  });
}

export function useBuyerMyReportsQuery() {
  return useQuery({
    queryKey: ['buyer', 'reports'],
    queryFn: () => getMyReports(),
  });
}

export function useBuyerSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sellerId,
      content,
      bikeId,
      attachment,
    }: {
      sellerId: string;
      content: string;
      bikeId?: string;
      attachment?: File | null;
    }) => {
      const sid = sellerId.trim();
      const fd = buildMessageFormData({
        content,
        bikeId: bikeId?.trim(),
        attachment,
      });
      return sendMessageToSeller(sid, fd);
    },
    onSettled: (_d, _e, { sellerId, bikeId }) => {
      // Invalidate the specific conversation thread (important for message threading)
      void qc.invalidateQueries({
        queryKey: queryKeys.buyer.messages(sellerId.trim(), { bikeId }),
      });
      // Also refresh the conversations list
      void qc.invalidateQueries({ queryKey: queryKeys.buyer.conversations() });
    },
  });
}

export function useBuyerCreateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) =>
      createTransaction(payload),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['buyer', 'transactions'] });
    },
  });
}

export function useBuyerCreatePaymentUrlMutation() {
  return useMutation({
    mutationFn: (params: {
      transactionId: string;
      bankCode?: string;
      language?: string;
    }) =>
      createPaymentUrl(params.transactionId, {
        bankCode: params.bankCode,
        language: params.language,
      }),
  });
}

export function useBuyerCreateRemainingPaymentUrlMutation() {
  return useMutation({
    mutationFn: (params: {
      depositTransactionId: string;
      bankCode?: string;
      language?: string;
    }) =>
      createRemainingPaymentUrl(params.depositTransactionId, {
        bankCode: params.bankCode,
        language: params.language,
      }),
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
      const responseCode = query.get('vnp_ResponseCode');
      const errorMsg = query.get('_error');

      try {
        // VNPay callback from browser redirect - check response code directly
        if (responseCode) {
          const isOk = responseCode === '00';
          return {
            success: isOk,
            message: isOk
              ? 'Thanh toán thành công! Giao dịch đã được xác nhận.'
              : errorMsg
                ? `Thanh toán thất bại: ${decodeURIComponent(errorMsg)}`
                : `Thanh toán thất bại (Mã lỗi: ${responseCode})`,
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

export type { BuyerBike, ReportReason };
