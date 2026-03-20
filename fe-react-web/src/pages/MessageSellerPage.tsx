import React, { useState } from 'react';
import { sendMessageToSeller, getMessagesWithSeller } from '../api/buyerApi';

export const MessageSellerPage: React.FC = () => {
  const [sellerId, setSellerId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await sendMessageToSeller(sellerId, { message });
      setSuccess(true);
      setMessage('');
      // Refresh messages
      const res = await getMessagesWithSeller(sellerId);
      setMessages(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMessagesWithSeller(sellerId);
      setMessages(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Nhắn tin cho seller
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Liên hệ người bán để hỏi thêm thông tin trước khi chốt đơn.
      </p>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Seller ID
          </label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            placeholder="Nhập Seller ID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Nội dung tin nhắn
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung"
            required
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="bg-[#f57224] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#e0651a] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </button>
          <button
            type="button"
            className="bg-gray-100 px-5 py-2.5 rounded-xl hover:bg-gray-200 text-gray-700 font-medium disabled:opacity-60"
            onClick={handleLoadMessages}
            disabled={loading || !sellerId}
          >
            Xem lịch sử
          </button>
          {success && (
            <div className="text-green-600 text-sm">
              Gửi tin nhắn thành công!
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
      </form>
      <div className="mt-6">
        <h2 className="font-semibold mb-2 text-gray-800">Lịch sử tin nhắn</h2>
        <div className="bg-gray-50 rounded-xl p-3 min-h-[80px] max-h-72 overflow-y-auto border border-gray-100">
          {messages.length === 0 ? (
            <div className="text-gray-400">Chưa có tin nhắn</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className="mb-2 p-2 rounded-lg bg-white border border-gray-100"
              >
                <span className="font-medium text-gray-800">
                  {msg.sender || 'Bạn'}:
                </span>{' '}
                <span className="text-gray-700">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
