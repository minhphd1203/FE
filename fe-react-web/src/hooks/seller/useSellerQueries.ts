import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteBike,
  getBikeDetail,
  getSellerBikesList,
  getMyDashboard,
  getMyOffers,
  getSalesStats,
  getSellerListingCategories,
  getSellerTransactionsList,
  getSellerTransactionDetail,
  updateSellerTransaction,
  getSellerConversations,
  getSellerPartnerMessages,
  sendSellerMessage,
  getSellerReviews,
  postBike,
  respondToOffer,
  updateBike,
  toggleSellerBikeVisibility,
  resubmitSellerBike,
  type SellerDashboardData,
  type SellerBikesListParams,
  type SellerBikeDetailApiResponse,
  type DeleteSellerBikeApiResponse,
  type SellerBikeVisibilityApiResponse,
  type SellerBikeResubmitApiResponse,
  type SellerTransactionsListParams,
  type SellerTransactionDetailResponse,
  type SellerTransactionUpdateResponse,
  type SellerConversationsResponse,
  type SellerPartnerMessagesParams,
  type SellerPartnerMessagesResponse,
  type SellerSendMessageResponse,
  type SellerReviewsResponse,
  type SellerTransactionUpdateBody,
} from '../../apis/sellerApi';
import { queryKeys } from '../query-keys';
import { buildMessageFormData } from '../../utils/messageFormData';

export function useSellerListingCategoriesQuery() {
  return useQuery({
    queryKey: ['seller', 'listing-categories'] as const,
    queryFn: () => getSellerListingCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSellerPostBikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => postBike(formData),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['seller', 'bikes'] });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

const defaultSellerBikesListParams: Required<
  Pick<SellerBikesListParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>
> = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useSellerMyBikesQuery(params: SellerBikesListParams = {}) {
  const merged: SellerBikesListParams = {
    ...defaultSellerBikesListParams,
    ...params,
  };
  return useQuery({
    queryKey: queryKeys.seller.myBikes(merged),
    queryFn: () => getSellerBikesList(merged),
  });
}

export function useSellerBikeDetailQuery(bikeId: string | undefined) {
  return useQuery<SellerBikeDetailApiResponse>({
    queryKey: queryKeys.seller.bike(bikeId ?? ''),
    queryFn: () => getBikeDetail(bikeId as string),
    enabled: Boolean(bikeId),
  });
}

export function useSellerUpdateBikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bikeId,
      formData,
    }: {
      bikeId: string;
      formData: FormData;
    }) => updateBike(bikeId, formData),
    onSettled: (_d, _e, { bikeId }) => {
      void qc.invalidateQueries({ queryKey: ['seller', 'bikes'] });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.bike(bikeId) });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

export function useSellerDeleteBikeMutation() {
  const qc = useQueryClient();
  return useMutation<DeleteSellerBikeApiResponse, unknown, string>({
    mutationFn: (bikeId: string) => deleteBike(bikeId),
    onSettled: (_data, _err, bikeId) => {
      void qc.invalidateQueries({ queryKey: ['seller', 'bikes'] });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.bike(bikeId) });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

export function useSellerToggleBikeVisibilityMutation() {
  const qc = useQueryClient();
  return useMutation<SellerBikeVisibilityApiResponse, unknown, string>({
    mutationFn: (bikeId: string) => toggleSellerBikeVisibility(bikeId),
    onSettled: (_data, _err, bikeId) => {
      void qc.invalidateQueries({ queryKey: ['seller', 'bikes'] });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.bike(bikeId) });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

export function useSellerResubmitBikeMutation() {
  const qc = useQueryClient();
  return useMutation<SellerBikeResubmitApiResponse, unknown, string>({
    mutationFn: (bikeId: string) => resubmitSellerBike(bikeId),
    onSettled: (_data, _err, bikeId) => {
      void qc.invalidateQueries({ queryKey: ['seller', 'bikes'] });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.bike(bikeId) });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

export function useSellerMyOffersQuery(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.seller.offers(page, limit),
    queryFn: () => getMyOffers(page, limit),
  });
}

export function useSellerRespondToOfferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      action,
      counterOffer,
    }: {
      offerId: string;
      action: 'accept' | 'reject';
      counterOffer?: number;
    }) => respondToOffer(offerId, action, counterOffer),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['seller', 'offers'] });
    },
  });
}

export function useSellerTransactionsQuery(
  params: SellerTransactionsListParams = {},
) {
  const merged: SellerTransactionsListParams = {
    page: 1,
    limit: 10,
    ...params,
  };
  return useQuery({
    queryKey: queryKeys.seller.transactionsList(merged),
    queryFn: () => getSellerTransactionsList(merged),
  });
}

export function useSellerTransactionDetailQuery(
  transactionId: string | undefined,
) {
  return useQuery<SellerTransactionDetailResponse>({
    queryKey: queryKeys.seller.transaction(transactionId ?? ''),
    queryFn: () => getSellerTransactionDetail(transactionId as string),
    enabled: Boolean(transactionId),
  });
}

export function useSellerUpdateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation<
    SellerTransactionUpdateResponse,
    unknown,
    { transactionId: string; body: SellerTransactionUpdateBody }
  >({
    mutationFn: ({ transactionId, body }) =>
      updateSellerTransaction(transactionId, body),
    onSettled: (_d, _e, { transactionId }) => {
      void qc.invalidateQueries({ queryKey: ['seller', 'transactions'] });
      void qc.invalidateQueries({
        queryKey: queryKeys.seller.transaction(transactionId),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.seller.dashboard() });
    },
  });
}

export function useSellerMessageThreadsQuery() {
  return useQuery<SellerConversationsResponse>({
    queryKey: queryKeys.seller.messageThreads(),
    queryFn: () => getSellerConversations(),
  });
}

export function useSellerPartnerMessagesQuery(
  partnerId: string | undefined,
  params: SellerPartnerMessagesParams = {},
) {
  const merged: SellerPartnerMessagesParams = {
    page: 1,
    limit: 30,
    ...params,
  };
  return useQuery<SellerPartnerMessagesResponse>({
    queryKey: queryKeys.seller.partnerMessages(partnerId ?? '', merged),
    queryFn: () => getSellerPartnerMessages(partnerId as string, merged),
    enabled: Boolean(partnerId),
  });
}

export function useSellerSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation<
    SellerSendMessageResponse,
    unknown,
    {
      partnerId: string;
      content: string;
      bikeId: string;
      attachment?: File | null;
    }
  >({
    mutationFn: ({ partnerId, content, bikeId, attachment }) =>
      sendSellerMessage(
        partnerId,
        buildMessageFormData({ content, bikeId, attachment }),
      ),
    onSettled: (_d, _e, { partnerId, bikeId }) => {
      // Invalidate the specific conversation thread (important for message threading)
      void qc.invalidateQueries({
        queryKey: queryKeys.seller.partnerMessages(partnerId, { bikeId }),
      });
      // Also refresh the thread list
      void qc.invalidateQueries({
        queryKey: queryKeys.seller.messageThreads(),
      });
    },
  });
}

export function useSellerReviewsQuery(page = 1, limit = 10) {
  return useQuery<SellerReviewsResponse>({
    queryKey: queryKeys.seller.reviews(page, limit),
    queryFn: () => getSellerReviews(page, limit),
  });
}

export function useSellerDashboardQuery() {
  return useQuery<SellerDashboardData>({
    queryKey: queryKeys.seller.dashboard(),
    queryFn: () => getMyDashboard(),
  });
}

export function useSellerSalesStatsQuery() {
  return useQuery({
    queryKey: queryKeys.seller.salesStats(),
    queryFn: () => getSalesStats(),
  });
}
