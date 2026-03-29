import React, { useState, useRef } from 'react';
import {
  useInspectorCloseConversationMutation,
  useInspectorConversationMessagesQuery,
  useInspectorConversationsQuery,
  useInspectorSendMessageMutation,
} from '../../hooks/inspector/useInspectorQueries';
import { resolvePublicFileUrl } from '../../utils/publicFileUrl';
import type { StaffConversationRow } from '../../utils/staffConversationUnwrap';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Bike,
  Paperclip,
  PhoneOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const InspectorChatPage: React.FC = () => {
  const [partnerId, setPartnerId] = useState('');
  const [bikeId, setBikeId] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: threads = [], isFetching: loadingThreads } =
    useInspectorConversationsQuery();
  const {
    data: messages = [],
    refetch: refetchMessages,
    isFetching: loadingMsgs,
  } = useInspectorConversationMessagesQuery(partnerId || undefined, {
    bikeId: bikeId || undefined,
    page: 1,
    limit: 80,
  });

  const sendMut = useInspectorSendMessageMutation();
  const closeMut = useInspectorCloseConversationMutation();
  const busy = sendMut.isPending || loadingMsgs;

  const activeThread = threads.find(
    (t: StaffConversationRow) =>
      t.partner?.id === partnerId && (t.bike?.id || '') === (bikeId || ''),
  );
  const partner = activeThread?.partner;
  const isClosed = activeThread?.conversationStatus === 'closed';

  const selectThread = (t: StaffConversationRow) => {
    setPartnerId(t.partner?.id ?? '');
    setBikeId(t.bike?.id ?? '');
    setError('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim() || !text.trim()) return;
    setError('');
    try {
      await sendMut.mutateAsync({
        userId: partnerId.trim(),
        content: text.trim(),
        bikeId: bikeId.trim() || undefined,
        attachment: file,
      });
      setText('');
      setFile(null);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        'Đóng hội thoại với người này? (PUT /inspector/v1/conversations/.../close)',
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
          'Chưa có tin nhắn giữa inspector và người dùng này — không thể đóng (404).',
        );
      } else {
        setError(ax.response?.data?.message || 'Không thể đóng hội thoại.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-500 mt-1 text-sm">
          GET{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">
            /inspector/v1/conversations
          </code>{' '}
          — đóng hội thoại dùng PUT (khác admin POST).
        </p>
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
                {threads.map((t: StaffConversationRow, idx: number) => {
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
              Hội thoại đã đóng — phía buyer/seller có thể không gửi tiếp theo
              luật backend.
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
                {messages.map((msg: Record<string, unknown>, idx: number) => {
                  const sid = String(msg.senderId ?? msg.sender ?? '');
                  const isMine = Boolean(sid) && sid !== partnerId;
                  const fileUrl = msg.fileUrl
                    ? resolvePublicFileUrl(String(msg.fileUrl))
                    : '';
                  const isImg =
                    fileUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl);

                  // Debug log
                  if (msg.fileUrl) {
                    console.log('Message has fileUrl:', {
                      id: msg.id,
                      fileUrl: msg.fileUrl,
                      resolvedUrl: fileUrl,
                      isImg,
                    });
                  }

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
                ref={fileInputRef}
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
                  partnerId ? 'Nội dung (FormData)…' : 'Chọn hội thoại'
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
