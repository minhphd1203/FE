/** Chuẩn hoá payload GET .../conversations (admin | inspector). */
export type StaffConversationRow = {
  partner?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string | null;
  };
  bike?: { id?: string; title?: string };
  lastMessage?: {
    content?: string;
    createdAt?: string;
    isMine?: boolean;
    isRead?: boolean;
  };
  conversationStatus?: 'active' | 'closed';
};

export function unwrapStaffConversationList(
  payload: unknown,
): StaffConversationRow[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as StaffConversationRow[];
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const d = (payload as { data: unknown }).data;
    if (Array.isArray(d)) return d as StaffConversationRow[];
    if (d && typeof d === 'object' && 'data' in (d as object)) {
      const inner = (d as { data: unknown }).data;
      return Array.isArray(inner) ? (inner as StaffConversationRow[]) : [];
    }
  }
  return [];
}

export function unwrapMessageList(payload: unknown): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const d = (payload as { data: unknown }).data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in (d as object)) {
      const inner = (d as { data: unknown }).data;
      return Array.isArray(inner) ? inner : [];
    }
  }
  return [];
}
