import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SearchBikesParams } from '../../api/bikeApi';
import {
  fetchBikesForInspector,
  getBikeDetails,
  getInspectionDetails,
  getInspectionHistory,
  getInspectorDashboard,
  getPendingBikes,
  startInspection,
  submitInspection,
} from '../../apis/inspectorApi';
import { queryKeys } from '../query-keys';
import { normalizeInspectorBikeDetail } from '../../utils/inspectorBikeDetail';
import { profileApi } from '../../apis/profileApi';

export function useInspectorPendingBikesQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.pendingBikes(),
    queryFn: async () => {
      const res = await getPendingBikes();
      return (res as { data?: unknown[] })?.data ?? [];
    },
  });
}

export function useInspectorBikeDetailQuery(bikeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inspector.bike(bikeId ?? ''),
    queryFn: async () => {
      const res = await getBikeDetails(bikeId as string);
      const raw = (res as { data?: unknown })?.data ?? res;
      const normalized = normalizeInspectorBikeDetail(raw);
      if (!normalized) return null;
      if (!normalized.id && bikeId) {
        normalized.id = bikeId;
      }
      return normalized;
    },
    enabled: Boolean(bikeId),
  });
}

export function useInspectorStartInspectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => startInspection(bikeId),
    onSettled: (_d, _e, bikeId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.inspector.bike(bikeId) });
      void qc.invalidateQueries({
        queryKey: queryKeys.inspector.pendingBikes(),
      });
    },
  });
}

export function useInspectorSubmitInspectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bikeId,
      data,
    }: {
      bikeId: string;
      data: Record<string, unknown>;
    }) => submitInspection(bikeId, data),
    onSettled: (_d, _e, { bikeId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.inspector.bike(bikeId) });
      void qc.invalidateQueries({
        queryKey: queryKeys.inspector.pendingBikes(),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.inspector.history() });
    },
  });
}

export function useInspectorHistoryQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.history(),
    queryFn: async () => {
      const res = await getInspectionHistory();
      return (res as { data?: unknown[] })?.data ?? [];
    },
  });
}

export function useInspectorHistoryDetailQuery(
  inspectionId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.inspector.historyDetail(inspectionId ?? ''),
    queryFn: async () => {
      const res = await getInspectionDetails(inspectionId as string);
      return (res as { data?: unknown })?.data ?? res;
    },
    enabled: Boolean(inspectionId),
  });
}

export function useInspectorDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.dashboard(),
    queryFn: async () => {
      const res = await getInspectorDashboard();
      const data = (res as any)?.data || {};
      return {
        pending: data.pending ?? 0,
        inProgress: data.inProgress ?? 0,
        completed: data.completed ?? 0,
        passed: data.passed ?? 0,
        failed: data.failed ?? 0,
      };
    },
  });
}

export function useInspectorSearchBikesQuery(params: SearchBikesParams) {
  return useQuery({
    queryKey: queryKeys.inspector.searchBikes(
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchBikesForInspector(params),
  });
}

/** GET /profile/v1/:userId — bổ sung tên/email seller khi API xe chỉ có sellerId */
export function useInspectorSellerProfileQuery(
  userId: string | null | undefined,
) {
  const id = userId?.trim() ?? '';
  return useQuery({
    queryKey: ['inspector', 'seller-profile', id] as const,
    queryFn: () => profileApi.getProfileByUserId(id),
    enabled: Boolean(id),
    retry: 1,
  });
}
