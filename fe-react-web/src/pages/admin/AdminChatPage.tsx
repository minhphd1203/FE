import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminCloseConversationMutation,
  useAdminConversationMessagesQuery,
  useAdminConversationsQuery,
  useAdminSendMessageMutation,
  useAdminUsersQuery,
} from '../../hooks/admin/useAdminQueries';
import { buildMessageFormData } from '../../utils/messageFormData';
import { resolvePublicFileUrl } from '../../utils/publicFileUrl';
import type { AdminConversationThread } from '../../apis/adminApi';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Bike,
  Paperclip,
  PhoneOff,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AdminChatPage: React.FC = () => {
  const [partnerId, setPartnerId] = useState('');
  const [bikeId, setBikeId] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  /** Gửi tin chủ động tới bất kỳ user (inspector, buyer, seller…) — không cần thread có sẵn. */
  const [composeUserId, setComposeUserId] = useState('');
  const [composeBikeId, setComposeBikeId] = useState('');
  const [composeText, setComposeText] = useState('');
  const [composeFile, setComposeFile] = useState<File | null>(null);
  const [composeError, setComposeError] = useState('');
  const [composeOk, setComposeOk] = useState('');

  const { data: threads = [], isFetching: loadingThreads } =
    useAdminConversationsQuery();
  const {
    data: messages = [],
    refetch: refetchMessages,
    isFetching: loadingMsgs,
  } = useAdminConversationMessagesQuery(partnerId || undefined, {
    bikeId: bikeId || undefined,
    page: 1,
    limit: 80,
  });

  const sendMut = useAdminSendMessageMutation();
  const closeMut = useAdminCloseConversationMutation();
  const { data: adminUsers = [], isLoading: loadingInspectorsList } =
    useAdminUsersQuery();
  const inspectors = useMemo(
    () =>
      adminUsers.filter((u) => String(u.role).toLowerCase() === 'inspector'),
    [adminUsers],
  );

  const busy = sendMut.isPending || loadingMsgs;
  const composeBusy = sendMut.isPending;
  const inspectorSelectValue = inspectors.some((i) => i.id === composeUserId)
    ? composeUserId
    : '';

  const activeThread = threads.find(
    (t: AdminConversationThread) =>
      t.partner?.id === partnerId && (t.bike?.id || '') === (bikeId || ''),
  );
  const partner = activeThread?.partner;
  const isClosed = activeThread?.conversationStatus === 'closed';

  const selectThread = (t: AdminConversationThread) => {
    setPartnerId(t.partner?.id ?? '');
    setBikeId(t.bike?.id ?? '');
    setError('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim() || !text.trim()) return;
    setError('');
    try {
      const fd = buildMessageFormData({
        content: text.trim(),
        bikeId: bikeId.trim() || undefined,
        attachment: file,
      });
      await sendMut.mutateAsync({ userId: partnerId.trim(), formData: fd });
      setText('');
      setFile(null);
      void refetchMessages();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Gửi tin thất bại.';
      setError(msg);
    }
  };

  const handleClose = async () => {
    if (!partnerId.trim()) return;
    if (
      !window.confirm(
        'Đóng hội thoại với người này? Buyer/seller sẽ không gửi tin tiếp tới admin.',
      )
    ) {
      return;
    }
    try {
      await closeMut.mutateAsync(partnerId.trim());
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (ax.response?.status === 404) {
        setError(
          'Chưa có tin nhắn giữa admin và người dùng này — không thể đóng (404).',
        );
      } else {
        setError(ax.response?.data?.message || 'Không thể đóng hội thoại.');
      }
    }
  };

  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = composeUserId.trim();
    if (!uid || !composeText.trim()) {
      setComposeError('Cần UUID người nhận và nội dung tin.');
      return;
    }
    setComposeError('');
    setComposeOk('');
    try {
      const fd = buildMessageFormData({
        content: composeText.trim(),
        bikeId: composeBikeId.trim() || undefined,
        attachment: composeFile,
      });
      await sendMut.mutateAsync({ userId: uid, formData: fd });
      setComposeText('');
      setComposeFile(null);
      setComposeOk(
        'Đã gửi tin nhắn. Cuộc hội thoại của bạn đã được cập nhật vào danh sách bên dưới.',
      );
      setPartnerId(uid);
      setBikeId(composeBikeId.trim());
      setError('');
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const st = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (st === 404) {
        setComposeError(msg || 'Không tìm thấy user với UUID này (404).');
      } else if (st === 400) {
        setComposeError(
          msg || 'Dữ liệu không hợp lệ (400): kiểm tra content / UUID.',
        );
      } else {
        setComposeError(msg || 'Gửi tin thất bại.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Quản lý tin nhắn với các tài khoản trong hệ thống. Mỗi dòng là một
          cuộc hội thoại đã được tạo. Bạn có thể nhắn tin với bất kỳ người dùng
          nào bao gồm cả nhân viên kiểm định.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#f57224]" />
          Nhắn inspector / user
        </h2>
        <p className="text-xs text-gray-600 mt-1 mb-4">
          Gửi tin nhắn chủ động tới <strong>kiểm định viên (inspector)</strong>{' '}
          từ danh sách hoặc dán UUID của người mua/người bán. Bạn có thể đính
          kèm thông tin xe (mã xe) hoặc tệp đa phương tiện tùy chọn. Nội dung
          tin nhắn là bắt buộc.
        </p>
        <form
          onSubmit={handleComposeSend}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">
              Chọn inspector
            </label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              value={inspectorSelectValue}
              disabled={loadingInspectorsList}
              onChange={(e) => {
                setComposeUserId(e.target.value);
                setComposeError('');
              }}
            >
              <option value="">
                {loadingInspectorsList
                  ? 'Đang tải danh sách…'
                  : inspectors.length === 0
                    ? '— Chưa có tài khoản inspector —'
                    : '— Chọn kiểm định viên —'}
              </option>
              {inspectors.map((u) => {
                const n = u.name?.trim();
                const label = n
                  ? `${n}${u.email ? ` · ${u.email}` : ''}`
                  : u.email || u.id;
                return (
                  <option key={u.id} value={u.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">
              Hoặc nhập UUID người nhận (bất kỳ role)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Dán UUID nếu không chọn inspector ở trên…"
              value={composeUserId}
              onChange={(e) => {
                setComposeUserId(e.target.value);
                setComposeError('');
              }}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">
              bikeId (tuỳ chọn)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="UUID xe…"
              value={composeBikeId}
              onChange={(e) => setComposeBikeId(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-medium text-gray-600">
              Nội dung *
            </label>
            <textarea
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[72px]"
              placeholder="Nội dung tin nhắn…"
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              Đính kèm (tuỳ chọn)
            </label>
            <input
              type="file"
              className="text-xs"
              accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
              onChange={(e) => setComposeFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={
                composeBusy || !composeUserId.trim() || !composeText.trim()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#f57224] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e0651a] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Gửi tin
            </button>
          </div>
        </form>
        {composeOk && (
          <p className="mt-3 text-sm text-emerald-700">{composeOk}</p>
        )}
        {composeError && (
          <p className="mt-3 text-sm text-red-600">{composeError}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[min(70vh,640px)]">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#f57224]" />
              Hội thoại
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingThreads && threads.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                Đang tải…
              </p>
            ) : threads.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                Chưa có hội thoại.
              </p>
            ) : (
              <div className="space-y-1">
                {threads.map((t: AdminConversationThread, idx: number) => {
                  const pid = t.partner?.id ?? '';
                  const bid = t.bike?.id ?? '';
                  const active = partnerId === pid && bikeId === bid;
                  return (
                    <button
                      key={`${pid}-${bid}-${idx}`}
                      type="button"
                      onClick={() => selectThread(t)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors flex gap-3 ${
                        active
                          ? 'border-[#f57224]/40 bg-orange-50/50'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {t.partner?.avatar ? (
                          <img
                            src={t.partner.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {t.partner?.name || t.partner?.email || pid || '—'}
                          </span>
                          {t.conversationStatus === 'closed' && (
                            <span className="text-[10px] uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                              Đóng
                            </span>
                          )}
                        </div>
                        {t.bike?.title && (
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                            <Bike className="w-3 h-3 shrink-0" />
                            {t.bike.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {t.lastMessage?.content}
                        </p>
                        {t.lastMessage?.createdAt && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(
                              new Date(t.lastMessage.createdAt),
                              { addSuffix: true, locale: vi },
                            ).replace('khoảng ', '')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[min(70vh,640px)]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {partnerId
                    ? partner?.name || partner?.email || 'Đối tác'
                    : 'Chọn hội thoại'}
                </p>
                {partnerId && (
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {partnerId}
                  </p>
                )}
              </div>
            </div>
            {partnerId && (
              <button
                type="button"
                onClick={() => void handleClose()}
                disabled={closeMut.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 shrink-0"
              >
                <PhoneOff className="w-4 h-4" />
                Đóng HĐ
              </button>
            )}
          </div>

          {isClosed && partnerId && (
            <div className="px-4 py-2 bg-amber-50 text-amber-900 text-sm border-b border-amber-100">
              Hội thoại đã đóng — phía buyer/seller không gửi tiếp được; admin
              vẫn có thể gửi để mở lại.
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/40">
            {!partnerId ? (
              <p className="text-center text-gray-500 py-16 text-sm">
                Chọn một hội thoại bên trái.
              </p>
            ) : loadingMsgs && messages.length === 0 ? (
              <p className="text-center text-gray-500 py-16">Đang tải tin…</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 py-16 text-sm">
                Chưa có tin nhắn.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg: any, idx: number) => {
                  const sid = String(msg.senderId ?? msg.sender ?? '');
                  const isMine = Boolean(sid) && sid !== partnerId;
                  const fileUrl = msg.fileUrl
                    ? resolvePublicFileUrl(String(msg.fileUrl))
                    : '';
                  const isImg =
                    fileUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl);
                  return (
                    <div
                      key={String(msg.id ?? idx)}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? 'bg-[#f57224] text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {String(msg.content ?? msg.message ?? '')}
                        </p>
                        {fileUrl &&
                          (isImg ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block"
                            >
                              <img
                                src={fileUrl}
                                alt=""
                                className="max-h-40 rounded-lg"
                              />
                            </a>
                          ) : (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 inline-flex items-center gap-1 underline text-xs ${isMine ? 'text-white/90' : 'text-[#f57224]'}`}
                            >
                              <Paperclip className="w-3 h-3" />
                              Tệp đính kèm
                            </a>
                          ))}
                        {msg.createdAt && (
                          <p
                            className={`text-[10px] mt-1 ${isMine ? 'text-white/80' : 'text-gray-400'}`}
                          >
                            {new Date(String(msg.createdAt)).toLocaleString(
                              'vi-VN',
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <Paperclip className="w-4 h-4" />
              <span>Đính kèm</span>
              <input
                type="file"
                className="text-xs"
                accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
                disabled={!partnerId}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm"
                placeholder={
                  partnerId
                    ? 'Nội dung (multipart / FormData)…'
                    : 'Chọn hội thoại'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!partnerId || busy}
              />
              <button
                type="submit"
                disabled={!partnerId || !text.trim() || busy}
                className="w-11 h-11 rounded-full bg-[#f57224] text-white flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            {error && (
              <p className="text-red-600 text-xs text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
