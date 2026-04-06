import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getFulfillmentDetail,
  updateDeliveryStatus,
  confirmReceipt,
  type FulfillmentDetailResponse,
  type UpdateDeliveryStatusBody,
} from '../apis/fulfillmentApi';

export const FULFILLMENT_QUERY_KEYS = {
  all: ['fulfillment'] as const,
  details: () => [...FULFILLMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FULFILLMENT_QUERY_KEYS.details(), id] as const,
};

export function useFulfillmentDetailQuery(transactionId: string | undefined) {
  return useQuery<FulfillmentDetailResponse>({
    queryKey: FULFILLMENT_QUERY_KEYS.detail(transactionId ?? ''),
    queryFn: () => getFulfillmentDetail(transactionId as string),
    enabled: Boolean(transactionId),
  });
}

export function useUpdateDeliveryStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      body,
    }: {
      transactionId: string;
      body: UpdateDeliveryStatusBody;
    }) => updateDeliveryStatus(transactionId, body),
    onSettled: (_data, _err, { transactionId }) => {
      void qc.invalidateQueries({
        queryKey: FULFILLMENT_QUERY_KEYS.detail(transactionId),
      });
      // Also invalidate historical transaction queries if relevant
      void qc.invalidateQueries({ queryKey: ['seller', 'transactions'] });
      void qc.invalidateQueries({ queryKey: ['buyer', 'transactions'] });
    },
  });
}

export function useConfirmReceiptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => confirmReceipt(transactionId),
    onSettled: (_data, _err, transactionId) => {
      void qc.invalidateQueries({
        queryKey: FULFILLMENT_QUERY_KEYS.detail(transactionId),
      });
      void qc.invalidateQueries({ queryKey: ['buyer', 'transactions'] });
    },
  });
}
