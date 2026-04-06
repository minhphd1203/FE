import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';
import {
  useMessageThreadQuery,
  useSendMessageMutation,
  useConversationsQuery,
} from '../../hooks/useMessageQueries';
import { toast } from 'sonner';

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

export const SellerMessageThreadPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [searchParams] = useSearchParams();
  const qpBike = searchParams.get('bikeId') || '';
  const [bikeId, setBikeId] = useState(qpBike);
  const [content, setContent] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qpBike) setBikeId(qpBike);
  }, [qpBike]);

  const { data: threadData, isLoading: isThreadLoading } =
    useMessageThreadQuery(partnerId || '', bikeId || '');
  const { data: convsData } = useConversationsQuery();
  const sendMut = useSendMessageMutation();

  const messages = threadData?.data || [];
  const conversations = convsData?.data || [];

  useEffect(() => {
    if (messages.length > 0 && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThreadLoading]);

  // Check if conversation is closed (optional, based on your business logic)
  const isClosed = useMemo(() => {
    // New API might not have 'closed' status yet in the same way,
    // but we can check if the partner or conversation exists in a specific state if needed.
    return false;
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !bikeId || !content.trim()) return;

    try {
      await sendMut.mutateAsync({
        partnerId,
        bikeId,
        content: content.trim(),
      });
      setContent('');
    } catch (err) {
      toast.error('Không thể gửi tin nhắn.');
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-5xl flex-col rounded-[32px] border-2 border-gray-50 bg-white shadow-2xl shadow-orange-100/20 overflow-hidden mt-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 py-5">
        <div className="flex items-center gap-5">
          <Link
            to="/seller/tin-nhan"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-[#f57224] transition-all group"
          >
            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              Hội thoại khách hàng
            </h1>
            <p className="text-[10px] font-black text-[#f57224] uppercase tracking-widest mt-0.5 opacity-60">
              ID: {partnerId?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Product Context Bar */}
      <div className="bg-orange-50/30 px-6 py-3 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-orange-400 border border-orange-100">
            ID
          </div>
          <p className="text-sm font-bold text-gray-700">
            Sản phẩm:{' '}
            <span className="font-mono text-[#f57224]">
              {bikeId?.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#FDFCFB] p-6 space-y-6">
        {isThreadLoading ? (
          <div className="flex h-full items-center justify-center grayscale opacity-30">
            <div className="w-8 h-8 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-orange-100 flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-orange-200" />
            </div>
            <p className="text-lg font-black text-gray-900">
              Bắt đầu trò chuyện
            </p>
            <p className="text-sm font-medium text-gray-400 max-w-xs mt-2">
              Hãy gửi tin nhắn đầu tiên để tư vấn cho khách hàng về chiếc xe
              này.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId !== partnerId;
            return (
              <div
                key={m.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`relative flex flex-col max-w-[80%] px-5 py-4 rounded-[24px] ${
                    isMe
                      ? 'bg-[#f57224] text-white rounded-tr-none shadow-xl shadow-orange-200/50'
                      : 'bg-white border-2 border-gray-50 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
                    {m.content}
                  </div>
                  <div
                    className={`mt-2 self-end text-[9px] font-black uppercase tracking-widest ${
                      isMe ? 'text-orange-100' : 'text-gray-300'
                    }`}
                  >
                    {formatMessageTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-6 py-5 border-t border-gray-100">
        <form className="flex items-center gap-4" onSubmit={handleSendMessage}>
          <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-[#f57224]/20 focus-within:bg-white transition-all overflow-hidden p-1">
            <textarea
              className="w-full resize-none bg-transparent px-4 py-3 text-[15px] font-medium focus:outline-none block min-h-[52px] max-h-32"
              rows={1}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              placeholder="Nhập nội dung tư vấn..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={sendMut.isPending || !content.trim()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f57224] text-white shadow-xl shadow-orange-200 disabled:grayscale disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
