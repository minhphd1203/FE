import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminApi,
  type AdminBike,
  type AdminCategory,
  type AdminConversationThread,
  type AdminReport,
  type AdminTransaction,
  type AdminUser,
} from '../../apis/adminApi';
import { queryKeys } from '../query-keys';
import {
  unwrapMessageList,
  unwrapStaffConversationList,
} from '../../utils/staffConversationUnwrap';

const adminReportStatusKey = (
  filter: 'all' | 'pending' | 'resolved' | 'closed' | 'rejected',
) => (filter === 'all' ? 'all' : filter);

const adminTxStatusKey = (
  filter: 'all' | 'pending' | 'completed' | 'cancelled',
) => (filter === 'all' ? 'all' : filter);

export function useAdminBikesQuery() {
  return useQuery({
    queryKey: queryKeys.admin.bikes(),
    queryFn: async (): Promise<AdminBike[]> => {
      const res = await adminApi.getBikes();
      if (res.success && res.data) {
        return Array.isArray(res.data) ? res.data : [];
      }
      return [];
    },
  });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: async (): Promise<AdminUser[]> => {
      const res = await adminApi.getUsers();
      if (res.success && res.data) {
        return Array.isArray(res.data) ? res.data : [];
      }
      return [];
    },
  });
}

export function useAdminReportsQuery(
  filterStatus: 'all' | 'pending' | 'resolved' | 'closed' | 'rejected',
) {
  const sk = adminReportStatusKey(filterStatus);
  return useQuery({
    queryKey: queryKeys.admin.reports(sk),
    queryFn: async (): Promise<AdminReport[]> => {
      const res = await adminApi.getReports({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      return res.data ?? [];
    },
  });
}

export function useAdminTransactionsQuery(
  filterStatus: 'all' | 'pending' | 'completed' | 'cancelled',
) {
  const sk = adminTxStatusKey(filterStatus);
  return useQuery({
    queryKey: queryKeys.admin.transactions(sk),
    queryFn: async (): Promise<AdminTransaction[]> => {
      const res = await adminApi.getTransactions({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      return res.data ?? [];
    },
  });
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.admin.categories(),
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await adminApi.getCategories();
      return res.data ?? [];
    },
  });
}

export function useAdminConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.conversations(),
    queryFn: async (): Promise<AdminConversationThread[]> => {
      const res = await adminApi.getConversationsList();
      if (Array.isArray(res.data)) return res.data;
      return unwrapStaffConversationList(res);
    },
  });
}

export function useAdminConversationMessagesQuery(
  userId: string | undefined,
  params?: { bikeId?: string; page?: number; limit?: number },
) {
  const uid = userId?.trim() ?? '';
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const bikeId = params?.bikeId?.trim();
  return useQuery({
    queryKey: queryKeys.admin.conversationMessages(uid, {
      bikeId,
      page,
      limit,
    }),
    queryFn: async () => {
      const res = await adminApi.getConversationMessages(uid, {
        bikeId,
        page,
        limit,
      });
      if (Array.isArray(res.data)) return res.data;
      return unwrapMessageList(res);
    },
    enabled: Boolean(uid),
  });
}

export function useDeleteAdminUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.users() });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.bikes() });
    },
  });
}

export function useAdminApproveBikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => adminApi.approveBike(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.bikes() });
    },
  });
}

export function useAdminRejectBikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bikeId, reason }: { bikeId: string; reason?: string }) =>
      adminApi.rejectBike(bikeId, reason),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.bikes() });
    },
  });
}

export function useAdminDeleteBikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bikeId: string) => adminApi.deleteBike(bikeId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.bikes() });
    },
  });
}

export function useAdminResolveReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      resolution,
      status,
    }: {
      reportId: string;
      resolution: string;
      status: 'resolved' | 'closed' | 'rejected';
    }) => adminApi.resolveReport(reportId, { resolution, status }),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

export function useAdminUpdateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'completed' | 'cancelled';
    }) => adminApi.updateTransaction(id, { status }),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
}

export function useAdminCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; slug: string; description?: string }) =>
      adminApi.createCategory(body),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories() });
    },
  });
}

export function useAdminUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; slug?: string; description?: string };
    }) => adminApi.updateCategory(id, body),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories() });
    },
  });
}

export function useAdminDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.categories() });
    },
  });
}

export function useAdminSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      formData,
    }: {
      userId: string;
      formData: FormData;
    }) => adminApi.sendMessage(userId, formData),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.conversations() });
      void qc.invalidateQueries({
        queryKey: ['admin', 'conversation-messages'],
      });
    },
  });
}

export function useAdminCloseConversationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.closeConversation(userId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.conversations() });
      void qc.invalidateQueries({
        queryKey: ['admin', 'conversation-messages'],
      });
    },
  });
}

export { adminReportStatusKey, adminTxStatusKey };
