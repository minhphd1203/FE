import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Paperclip, Send } from 'lucide-react';

const formatMessageTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};
import {
  useSellerMessageThreadsQuery,
  useSellerPartnerMessagesQuery,
  useSellerSendMessageMutation,
} from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';
import { resolvePublicFileUrl } from '../../utils/publicFileUrl';
import { formatChatSendError } from '../../utils/chatErrors';

export const SellerMessageThreadPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [searchParams] = useSearchParams();
  const qpBike = searchParams.get('bikeId') || '';
  const [bikeId, setBikeId] = useState(qpBike);
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qpBike) setBikeId(qpBike);
  }, [qpBike]);

  const msgQ = useSellerPartnerMessagesQuery(partnerId, {
    bikeId: bikeId.trim() || undefined,
  });
  const threadsQ = useSellerMessageThreadsQuery();
  const sendMut = useSellerSendMessageMutation();

  const messages = useMemo(
    () => unwrapApiList(msgQ.data?.data ?? msgQ.data),
    [msgQ.data],
  );

  useEffect(() => {
    // Auto scroll to bottom when messages change
    if (messages.length > 0 && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, msgQ.isLoading]);

  const threadRows = useMemo(
    () => unwrapApiList(threadsQ.data),
    [threadsQ.data],
  );

  const conversationClosed = useMemo(() => {
    const bid = bikeId.trim();
    if (!partnerId || !bid) return false;
    const row = threadRows.find((item) => {
      const r = asRecord(item) ?? {};
      const partner = asRecord(r.partner) ?? {};
      const pid =
        pickStr(r, ['partnerId', 'buyerId', 'userId', 'id']) ||
        pickStr(partner, ['id']);
      const bike = asRecord(r.bike) ?? {};
      const b =
        pickStr(r, ['bikeId', 'bike_id']) || pickStr(bike, ['id']) || '';
      return pid === partnerId && b === bid;
    });
    const st = pickStr(asRecord(row) ?? {}, [
      'conversationStatus',
      'conversation_status',
    ]);
    return st === 'closed';
  }, [threadRows, partnerId, bikeId]);

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-4xl flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/seller/tin-nhan"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Khách hàng
            </h1>
            <p className="text-sm font-mono text-[#f57224] mt-0.5">
              Đối tác:{' '}
              {partnerId ? `#${partnerId.substring(0, 8).toUpperCase()}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar (Bike ID) */}
      <div className="bg-gray-50/50 px-4 py-3 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
            Mã tin (bikeId)
          </label>
          <input
            className="w-full sm:max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]/50"
            value={bikeId}
            onChange={(e) => setBikeId(e.target.value)}
            placeholder="Nhập UUID mã tin để tiếp tục hội thoại..."
          />
        </div>
        {conversationClosed && (
          <div className="mt-3 text-sm font-medium text-amber-800 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Hội thoại cho tin này đã bị
            đóng. Không thể gửi thêm tin nhắn mới.
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 space-y-5">
        {msgQ.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-medium text-gray-400">
              Đang tải tin nhắn…
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <span className="text-3xl text-gray-400">💬</span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              Chưa có tin nhắn nào
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Mã tin hiện tại:{' '}
              <span className="font-mono text-[#f57224]">
                {bikeId
                  ? `#${bikeId.substring(0, 8).toUpperCase()}`
                  : 'Chưa nhập'}
              </span>
              .<br />
              Hãy chọn đúng mã tin để tải toàn bộ lịch sử trò chuyện.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const r = asRecord(m) ?? {};
            const text = pickStr(r, ['content', 'message', 'body', 'text']);
            const at = pickStr(r, ['createdAt', 'sentAt', 'timestamp']);
            const rawFile = pickStr(r, ['fileUrl', 'file_url']);
            const fileUrl = rawFile ? resolvePublicFileUrl(rawFile) : '';
            const senderId = pickStr(r, ['senderId', 'sender_id']);

            // if senderId equals partnerId, it was sent by the partner (buyer). Otherwise, sent by me (seller).
            const isPartner = senderId === partnerId;
            const isImg =
              fileUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl);

            return (
              <div
                key={pickStr(r, ['id', '_id']) || `m-${i}`}
                className={`flex w-full ${isPartner ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`relative flex flex-col max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${
                    isPartner
                      ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                      : 'bg-[#f57224] text-white rounded-tr-sm shadow-md'
                  }`}
                >
                  {fileUrl && (
                    <div className="mb-2">
                      {isImg ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg"
                        >
                          <img
                            src={fileUrl}
                            alt="Đính kèm"
                            className="max-h-60 w-auto object-contain bg-black/5"
                          />
                        </a>
                      ) : (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isPartner
                              ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Paperclip className="h-4 w-4" />
                          Tải tệp đính kèm
                        </a>
                      )}
                    </div>
                  )}
                  {text && (
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
                      {text}
                    </div>
                  )}
                  {at && (
                    <div
                      className={`mt-1.5 self-end text-[11px] font-medium tracking-wide ${
                        isPartner ? 'text-gray-400' : 'text-[#ffe5d9]'
                      }`}
                    >
                      {formatMessageTime(at)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {attachment && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 border border-gray-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <Paperclip className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="truncate text-xs font-medium text-gray-700">
                {attachment.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="ml-4 text-xs font-semibold text-red-600 hover:text-red-700 uppercase tracking-wide"
            >
              Xóa
            </button>
          </div>
        )}

        <form
          className="flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !partnerId ||
              !bikeId.trim() ||
              !content.trim() ||
              conversationClosed
            ) {
              return;
            }
            void sendMut
              .mutateAsync({
                partnerId,
                bikeId: bikeId.trim(),
                content: content.trim(),
                attachment,
              })
              .then(() => {
                setContent('');
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                void msgQ.refetch();
                setTimeout(() => {
                  messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              })
              .catch((err) => window.alert(formatChatSendError(err)));
          }}
        >
          <div className="cursor-pointer mb-0.5">
            <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Paperclip className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                disabled={conversationClosed}
              />
            </label>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[#f57224] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#f57224]/20 overflow-hidden transition-all">
            <textarea
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-[15px] focus:outline-none block"
              rows={1}
              value={content}
              disabled={conversationClosed}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              placeholder={
                !bikeId.trim()
                  ? 'Nhập Mã tin ở trên trước khi gửi...'
                  : conversationClosed
                    ? 'Hội thoại đã đóng'
                    : 'Nhắn tin...'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true }),
                  );
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={
              sendMut.isPending ||
              !bikeId.trim() ||
              !content.trim() ||
              !partnerId ||
              conversationClosed
            }
            className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f57224] text-white shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
