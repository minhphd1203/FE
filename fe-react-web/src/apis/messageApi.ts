import apiClient from './apiClient';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bikeId: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  threadId?: string;
  status?: 'open' | 'closed';
  partner: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  bike?: {
    id: string;
    title: string;
    images?: string[];
  };
  lastMessage: Message;
  unreadCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /api/messages/conversations */
export async function getConversations() {
  const res = await apiClient.get<{ success: boolean; data: Conversation[] }>(
    '/messages/conversations',
  );
  return res.data;
}

/** GET /api/messages/{partnerId}/{bikeId} */
export async function getMessageThread(partnerId: string, bikeId: string) {
  const res = await apiClient.get<{ success: boolean; data: Message[] }>(
    `/messages/${partnerId}/${bikeId}`,
  );
  return res.data;
}

/** POST /api/messages/{partnerId} */
export async function sendMessage(
  partnerId: string,
  data: { content: string; bikeId?: string; attachment?: File | null },
) {
  const fd = new FormData();
  fd.append('content', data.content);
  if (data.bikeId?.trim()) {
    fd.append('bikeId', data.bikeId.trim());
  }
  if (data.attachment) {
    fd.append('attachment', data.attachment);
  }
  const res = await apiClient.post<{ success: boolean; data: Message }>(
    `/messages/${partnerId}`,
    fd,
  );
  return res.data;
}

/** DELETE /api/messages/{partnerId}/close */
export async function closeConversation(partnerId: string) {
  const res = await apiClient.delete<{ success: boolean; message: string }>(
    `/messages/${partnerId}/close`,
  );
  return res.data;
}
