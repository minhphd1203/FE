import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useConversationsQuery,
  useMessageThreadQuery,
  useSendMessageMutation,
} from '../hooks/useMessageQueries';
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Bike,
  ChevronRight,
  Search,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export const MessageSellerPage: React.FC = () => {
  const [activePartnerId, setActivePartnerId] = useState('');
  const [activeBikeId, setActiveBikeId] = useState('');
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch unified conversations
  const { data: convsData, isLoading: isConvsLoading } =
    useConversationsQuery();
  const conversations = convsData?.data || [];

  // 2. Fetch thread detail
  const { data: threadData, isLoading: isThreadLoading } =
    useMessageThreadQuery(activePartnerId, activeBikeId);
  const messages = threadData?.data || [];

  const sendMut = useSendMessageMutation();

  useEffect(() => {
    if (messages.length > 0 && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThreadLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartnerId || !activeBikeId || !message.trim()) return;
    try {
      await sendMut.mutateAsync({
        partnerId: activePartnerId,
        bikeId: activeBikeId,
        content: message.trim(),
      });
      setMessage('');
    } catch (err) {
      toast.error('Không thể gửi tin nhắn.');
    }
  };

  const activeConv = conversations.find(
    (c) =>
      c.partner.id === activePartnerId &&
      String(c.lastMessage.bikeId) === String(activeBikeId),
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Hộp thư Trò chuyện
          </h1>
          <p className="text-gray-500 font-medium">
            Nơi kết nối và trao đổi trực tiếp với những người bán xe uy tín.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 h-[750px]">
          {/* Left: Conversation List */}
          <div className="lg:col-span-4 bg-white rounded-[40px] shadow-2xl shadow-orange-100/30 border border-gray-50 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hội thoại..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {isConvsLoading ? (
                <div className="py-20 flex flex-col items-center opacity-30">
                  <div className="w-8 h-8 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Đang tải danh sách...
                  </p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-20 text-center px-6">
                  <div className="w-16 h-16 bg-orange-50 text-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm leading-relaxed">
                    Bạn chưa có cuộc trò chuyện nào.
                    <br />
                    Hãy bắt đầu hỏi mua sản phẩm!
                  </p>
                </div>
              ) : (
                conversations.map((conv, idx) => {
                  const isActive =
                    activePartnerId === conv.partner.id &&
                    activeBikeId === (conv.lastMessage.bikeId || '');
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActivePartnerId(conv.partner.id);
                        setActiveBikeId(conv.lastMessage.bikeId || '');
                      }}
                      className={`w-full text-left p-4 rounded-[28px] transition-all flex gap-4 items-center group
                        ${isActive ? 'bg-orange-50/50 ring-2 ring-orange-100 shadow-lg shadow-orange-100/20' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-300">
                        {conv.partner.avatar ? (
                          <img
                            src={conv.partner.avatar}
                            alt={conv.partner.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p
                            className={`font-black text-[15px] truncate ${isActive ? 'text-[#f57224]' : 'text-gray-900'}`}
                          >
                            {conv.partner.name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-[#f57224] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-500 line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-all ${isActive ? 'text-[#f57224] translate-x-1' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Chat Window */}
          <div className="lg:col-span-8 bg-white rounded-[44px] shadow-2xl shadow-orange-100/30 border border-gray-50 flex flex-col overflow-hidden relative">
            {!activePartnerId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#FDFCFB]/50">
                <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl shadow-orange-100 flex items-center justify-center mb-8 animate-bounce duration-[2000ms]">
                  <MessageCircle className="w-12 h-12 text-orange-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Chọn cuộc hội thoại
                </h3>
                <p className="text-gray-400 font-medium max-w-xs">
                  Chọn một người bán từ danh sách bên trái để bắt đầu trao đổi
                  chi tiết về sản phẩm.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-5 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400 overflow-hidden shadow-inner">
                      {activeConv?.partner.avatar ? (
                        <img
                          src={activeConv.partner.avatar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-black text-xl text-gray-900 leading-tight">
                        {activeConv?.partner.name || 'Người bán'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-70">
                          Đang trực tuyến
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeBikeId && (
                    <div className="hidden sm:flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-2xl border border-gray-100">
                      <Bike className="w-4 h-4 text-[#f57224]" />
                      <p className="text-[11px] font-black text-gray-500 uppercase tracking-tight">
                        Sản phẩm:{' '}
                        <span className="text-gray-900">
                          #{activeBikeId.slice(0, 8).toUpperCase()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFCFB] custom-scrollbar">
                  {isThreadLoading && messages.length === 0 ? (
                    <div className="py-20 flex justify-center grayscale opacity-30">
                      <div className="w-10 h-10 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId !== activePartnerId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                        >
                          <div
                            className={`relative max-w-[75%] rounded-[30px] px-6 py-4 shadow-xl shadow-gray-100/40 ${
                              isMe
                                ? 'bg-[#f57224] text-white rounded-tr-none shadow-orange-200/50'
                                : 'bg-white border-2 border-gray-50 text-gray-800 rounded-tl-none shadow-gray-200/20'
                            }`}
                          >
                            <p className="text-[15px] font-medium leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <div
                              className={`mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-white' : 'text-gray-400'}`}
                            >
                              <Clock className="w-3 h-3" />
                              {new Date(msg.createdAt).toLocaleTimeString(
                                'vi-VN',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messageEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <form
                    onSubmit={handleSend}
                    className="flex gap-4 items-center"
                  >
                    <div className="flex-1 bg-gray-50 rounded-[28px] border-2 border-transparent focus-within:border-orange-100 focus-within:bg-white transition-all overflow-hidden p-1.5 flex items-center">
                      <textarea
                        rows={1}
                        className="flex-1 bg-transparent px-6 py-3 text-[15px] font-bold focus:outline-none resize-none max-h-32"
                        placeholder="Viết tin nhắn cho người bán..."
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!message.trim() || sendMut.isPending}
                      className="w-16 h-16 bg-[#f57224] text-white rounded-3xl flex items-center justify-center hover:bg-[#e0651a] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-200 disabled:grayscale disabled:opacity-30 disabled:scale-100"
                    >
                      <Send className="w-7 h-7" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
