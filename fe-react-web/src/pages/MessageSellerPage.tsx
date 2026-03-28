import React, { useState } from 'react';
import {
  useBuyerConversationsQuery,
  useBuyerMessagesWithSellerQuery,
  useBuyerSendMessageMutation,
} from '../hooks/buyer/useBuyerQueries';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Bike,
  Paperclip,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { resolvePublicFileUrl } from '../utils/publicFileUrl';
import { formatChatSendError } from '../utils/chatErrors';

export const MessageSellerPage: React.FC = () => {
  const [activeSellerId, setActiveSellerId] = useState('');
  const [activeBikeId, setActiveBikeId] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState('');

  // 1. Fetch danh sách hội thoại
  const { data: conversations = [], isFetching: isFetchingConversations } =
    useBuyerConversationsQuery();

  // 2. Fetch chi tiết tin nhắn khi có activeSellerId
  const {
    data: messages = [],
    refetch,
    isFetching: isFetchingMessages,
  } = useBuyerMessagesWithSellerQuery(activeSellerId, {
    bikeId: activeBikeId || undefined,
  });

  const sendMut = useBuyerSendMessageMutation();
  const loading = sendMut.isPending || isFetchingMessages;

  const handleSelectConversation = (partnerId: string, bikeId: string) => {
    setActiveSellerId(partnerId);
    setActiveBikeId(bikeId);
    setError('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSellerId || !message.trim()) return;
    setError('');
    try {
      await sendMut.mutateAsync({
        sellerId: activeSellerId,
        content: message.trim(),
        bikeId: activeBikeId || undefined,
        attachment,
      });
      setMessage('');
      setAttachment(null);
      refetch();
    } catch (err: unknown) {
      setError(formatChatSendError(err));
    }
  };

  const activeConv = conversations.find(
    (c: {
      partner?: { id?: string };
      bike?: { id?: string };
      conversationStatus?: string;
    }) =>
      c.partner?.id === activeSellerId &&
      String(c.bike?.id ?? '') === String(activeBikeId ?? ''),
  );
  const activePartner = activeConv?.partner;
  const conversationClosed = activeConv?.conversationStatus === 'closed';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Hội thoại với người bán
        </h1>
        <p className="text-gray-500">
          Lịch sử trò chuyện về các xe bạn đang quan tâm hoặc đã hỏi mua.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar: Conversation List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#f57224]" />
              Danh sách tin nhắn
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isFetchingConversations && conversations.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-sm">
                Đang tải danh sách...
              </p>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-gray-500 text-sm">
                  Chưa có cuộc hội thoại nào.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv, idx) => {
                  const isActive =
                    activeSellerId === conv.partner?.id &&
                    activeBikeId === (conv.bike?.id || '');
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        handleSelectConversation(
                          conv.partner?.id,
                          conv.bike?.id || '',
                        )
                      }
                      className={`w-full text-left p-3 rounded-xl transition-colors flex gap-3 items-start
                        ${isActive ? 'bg-[#f57224]/5 border border-[#f57224]/20' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <img
                        src={
                          conv.partner?.avatar ||
                          'https://via.placeholder.com/40'
                        }
                        alt={conv.partner?.name || 'Seller'}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p
                            className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-[#f57224]' : 'text-gray-900'}`}
                          >
                            {conv.partner?.name || 'Người bán (Đã xóa)'}
                          </p>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(
                                new Date(conv.lastMessage.createdAt),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                },
                              ).replace('khoảng ', '')}
                            </span>
                          )}
                        </div>
                        {conv.bike?.title && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 truncate">
                            <Bike className="w-3.5 h-3.5" />
                            <span className="truncate">{conv.bike.title}</span>
                          </div>
                        )}
                        <p
                          className={`text-sm truncate ${conv.lastMessage?.isRead === false && !conv.lastMessage?.isMine ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                        >
                          {conv.lastMessage?.isMine ? 'Bạn: ' : ''}
                          {conv.lastMessage?.content || ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden border border-gray-200">
              {activePartner?.avatar ? (
                <img
                  src={activePartner.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 leading-tight truncate">
                {activeSellerId
                  ? activePartner?.name || 'Người bán'
                  : 'Chưa chọn hội thoại'}
              </p>
              {activeSellerId && (
                <p className="text-xs text-gray-500 truncate">
                  ID: <span className="font-mono">{activeSellerId}</span>
                </p>
              )}
            </div>
          </div>
          {conversationClosed && activeSellerId && (
            <div className="px-4 py-2 bg-amber-50 text-amber-900 text-xs border-b border-amber-100">
              Hội thoại đã đóng — bạn không thể gửi tin theo luật hệ thống (403
              nếu thử gửi).
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
            {!activeSellerId ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin.
                </p>
              </div>
            ) : isFetchingMessages && messages.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                Đang tải tin nhắn...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 py-10 bg-white border border-gray-100 rounded-xl">
                Chưa có tin nhắn nào.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: any, idx: number) => {
                  const isMine =
                    msg.senderId !== activeSellerId &&
                    msg.sender !== activeSellerId;
                  const fileUrl = msg.fileUrl
                    ? resolvePublicFileUrl(String(msg.fileUrl))
                    : '';
                  const isImage =
                    fileUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl);
                  return (
                    <div
                      key={idx}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-[#f57224] text-white rounded-tr-sm shadow-sm shadow-[#f57224]/10' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}
                      >
                        {msg.bikeId &&
                          !isMine &&
                          msg.bikeId !== activeBikeId && (
                            <div className="text-[10px] opacity-70 mb-1 border-b border-gray-200 pb-1 font-mono">
                              Tham chiếu xe: {msg.bikeId}
                            </div>
                          )}
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {msg.content ?? msg.message}
                        </p>
                        {fileUrl &&
                          (isImage ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 block ${isMine ? 'text-white/90' : ''}`}
                            >
                              <img
                                src={fileUrl}
                                alt="Đính kèm"
                                className="max-h-48 rounded-lg object-cover border border-white/20"
                              />
                            </a>
                          ) : (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 inline-flex items-center gap-1 text-sm underline ${isMine ? 'text-white/90' : 'text-[#f57224]'}`}
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              Tệp đính kèm
                            </a>
                          ))}
                        {msg.createdAt && (
                          <p
                            className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/80' : 'text-gray-400'}`}
                          >
                            {new Date(msg.createdAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <label className="inline-flex items-center gap-1 cursor-pointer shrink-0">
                <Paperclip className="w-4 h-4" />
                <span>Đính kèm</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
                  disabled={!activeSellerId || conversationClosed}
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                />
              </label>
              {attachment && (
                <span className="truncate text-gray-700">
                  {attachment.name}
                </span>
              )}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
                placeholder={
                  activeSellerId
                    ? 'Nhập tin nhắn...'
                    : 'Vui lòng chọn hội thoại trước'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!activeSellerId || loading || conversationClosed}
              />
              <button
                type="submit"
                disabled={
                  !activeSellerId ||
                  !message.trim() ||
                  loading ||
                  conversationClosed
                }
                className="w-11 h-11 flex-shrink-0 bg-[#f57224] text-white rounded-full flex items-center justify-center hover:bg-[#e0651a] disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
            {error && (
              <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
