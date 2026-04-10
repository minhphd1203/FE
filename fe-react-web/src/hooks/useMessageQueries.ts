import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getMessageThread,
  sendMessage,
  closeConversation,
} from '../apis/messageApi';

export const MESSAGE_QUERY_KEYS = {
  all: ['messages'] as const,
  conversations: () => [...MESSAGE_QUERY_KEYS.all, 'conversations'] as const,
  threads: () => [...MESSAGE_QUERY_KEYS.all, 'threads'] as const,
  thread: (partnerId: string, bikeId: string) =>
    [...MESSAGE_QUERY_KEYS.threads(), partnerId, bikeId] as const,
};

export function useConversationsQuery() {
  return useQuery({
    queryKey: MESSAGE_QUERY_KEYS.conversations(),
    queryFn: getConversations,
  });
}

export function useMessageThreadQuery(partnerId: string, bikeId: string) {
  return useQuery({
    queryKey: MESSAGE_QUERY_KEYS.thread(partnerId, bikeId),
    queryFn: () => getMessageThread(partnerId, bikeId),
    enabled: Boolean(partnerId && bikeId),
  });
}

export function useSendMessageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      content,
      bikeId,
      attachment,
    }: {
      partnerId: string;
      content: string;
      bikeId?: string;
      attachment?: File | null;
    }) => sendMessage(partnerId, { content, bikeId, attachment }),
    onSuccess: (_, { partnerId, bikeId }) => {
      void qc.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEYS.conversations(),
      });
      if (bikeId) {
        void qc.invalidateQueries({
          queryKey: MESSAGE_QUERY_KEYS.thread(partnerId, bikeId),
        });
      }
    },
  });
}

export function useCloseConversationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => closeConversation(partnerId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEYS.conversations(),
      });
    },
  });
}
