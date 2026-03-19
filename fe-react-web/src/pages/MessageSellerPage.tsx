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
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Nhắn tin cho Seller</h1>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Seller ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            placeholder="Nhập Seller ID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Nội dung tin nhắn</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
        </button>
        <button
          type="button"
          className="ml-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={handleLoadMessages}
          disabled={loading || !sellerId}
        >
          Xem lịch sử tin nhắn
        </button>
        {success && (
          <div className="text-green-600 mt-2">Gửi tin nhắn thành công!</div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Lịch sử tin nhắn</h2>
        <div className="bg-gray-50 rounded p-3 min-h-[60px] max-h-60 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-gray-400">Chưa có tin nhắn</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <span className="font-medium">{msg.sender || 'Bạn'}:</span>{' '}
                {msg.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
