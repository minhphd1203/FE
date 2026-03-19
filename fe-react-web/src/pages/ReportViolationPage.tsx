import React, { useState } from 'react';
import { reportViolation } from '../api/buyerApi';

export const ReportViolationPage: React.FC = () => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await reportViolation({ reason, details });
      setSuccess(true);
      setReason('');
      setDetails('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Báo cáo vi phạm</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Lý do</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Nhập lý do vi phạm"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Chi tiết</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Mô tả chi tiết vi phạm (nếu có)"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
        {success && (
          <div className="text-green-600 mt-2">Gửi báo cáo thành công!</div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};
