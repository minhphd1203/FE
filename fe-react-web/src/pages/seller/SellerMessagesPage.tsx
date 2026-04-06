import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, User } from 'lucide-react';
import { useConversationsQuery } from '../../hooks/useMessageQueries';

export const SellerMessagesPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useConversationsQuery();
  const conversations = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Về kênh bán
      </Link>
      <h1 className="text-3xl font-black text-gray-900 mb-1 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f57224]">
          <MessageCircle className="w-7 h-7" />
        </div>
        Tin nhắn khách hàng
      </h1>
      <p className="text-gray-500 font-medium mb-8">
        Quản lý tất cả cuộc hội thoại và giải đáp thắc mắc của người mua xe.
      </p>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
          <div className="w-10 h-10 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Đang tải hội thoại...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border-2 border-red-100 bg-red-50/50 text-red-700 p-6 flex flex-col items-center text-center">
          <p className="font-bold mb-4">Không thể kết nối máy chủ tin nhắn.</p>
          <button
            type="button"
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
            onClick={() => void refetch()}
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/30">
          <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            Chưa có tin nhắn nào
          </p>
        </div>
      )}

      <ul className="space-y-4">
        {conversations.map((conv, idx) => {
          const { partner, lastMessage, unreadCount } = conv;
          const bikeId = lastMessage.bikeId;

          return (
            <li key={`${partner.id}-${idx}`}>
              <Link
                to={`/seller/tin-nhan/${partner.id}${bikeId ? `?bikeId=${bikeId}` : ''}`}
                className="group block rounded-[24px] border-2 border-gray-50 bg-white p-5 shadow-sm hover:border-[#f57224]/30 hover:shadow-xl hover:shadow-orange-100/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-[#f57224] transition-colors">
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-black text-gray-900 group-hover:text-[#f57224] transition-colors truncate">
                        {partner.name || 'Khách hàng'}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(lastMessage.createdAt).toLocaleDateString(
                          'vi-VN',
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-gray-500 line-clamp-1">
                        {lastMessage.content}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-[#f57224] text-white text-[10px] font-black px-2 py-1 rounded-full min-w-[20px] text-center shadow-lg shadow-orange-200">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
