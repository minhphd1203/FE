import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SearchBikesParams } from '../../api/bikeApi';
import {
  closeInspectorConversation,
  fetchBikesForInspector,
  getBikeDetails,
  getInspectionDetails,
  getInspectionHistory,
  getInspectorConversationMessages,
  getInspectorConversationsList,
  getInspectorDashboard,
  getPendingBikes,
  sendInspectorMessage,
  startInspection,
  submitInspection,
} from '../../apis/inspectorApi';
import { queryKeys } from '../query-keys';
import { normalizeInspectorBikeDetail } from '../../utils/inspectorBikeDetail';
import { profileApi } from '../../apis/profileApi';
import { buildMessageFormData } from '../../utils/messageFormData';
import {
  type StaffConversationRow,
  unwrapMessageList,
  unwrapStaffConversationList,
} from '../../utils/staffConversationUnwrap';

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

export function useInspectorConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.inspector.conversations(),
    queryFn: async (): Promise<StaffConversationRow[]> => {
      const raw = await getInspectorConversationsList();
      return unwrapStaffConversationList(raw);
    },
  });
}

export function useInspectorConversationMessagesQuery(
  userId: string | undefined,
  params?: { bikeId?: string; page?: number; limit?: number },
) {
  const uid = userId?.trim() ?? '';
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const bikeId = params?.bikeId?.trim();
  return useQuery({
    queryKey: queryKeys.inspector.conversationMessages(uid, {
      bikeId,
      page,
      limit,
    }),
    queryFn: async () => {
      const raw = await getInspectorConversationMessages(uid, {
        bikeId,
        page,
        limit,
      });
      return unwrapMessageList(raw);
    },
    enabled: Boolean(uid),
  });
}

export function useInspectorSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      content,
      bikeId,
      attachment,
    }: {
      userId: string;
      content: string;
      bikeId?: string;
      attachment?: File | null;
    }) => {
      const fd = buildMessageFormData({
        content,
        bikeId: bikeId?.trim(),
        attachment,
      });
      return sendInspectorMessage(userId.trim(), fd);
    },
    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.inspector.conversations(),
      });
      void qc.invalidateQueries({
        queryKey: ['inspector', 'conversation-messages'],
      });
    },
  });
}

export function useInspectorCloseConversationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => closeInspectorConversation(userId.trim()),
    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.inspector.conversations(),
      });
      void qc.invalidateQueries({
        queryKey: ['inspector', 'conversation-messages'],
      });
    },
  });
}
