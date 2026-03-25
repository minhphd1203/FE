/** Thông báo gửi tin (buyer/seller) khi BE trả 403 hoặc message chung. */
export function formatChatSendError(err: unknown): string {
  const ax = err as {
    response?: { status?: number; data?: { message?: string } };
  };
  const status = ax.response?.status;
  const raw = ax.response?.data?.message?.trim();

  if (status === 403) {
    if (raw) return raw;
    return 'Không thể gửi tin: chỉ được trả lời khi admin/inspector đã nhắn trước, hoặc hội thoại đã đóng.';
  }

  return raw || 'Có lỗi xảy ra khi gửi tin nhắn.';
}
