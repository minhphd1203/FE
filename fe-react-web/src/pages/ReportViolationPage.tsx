import React, { useState } from 'react';
import { useBuyerReportViolationMutation } from '../hooks/buyer/useBuyerQueries';

export const ReportViolationPage: React.FC = () => {
  const reportMut = useBuyerReportViolationMutation();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [reportedUserId, setReportedUserId] = useState('');
  const [reportedBikeId, setReportedBikeId] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await reportMut.mutateAsync({
        reason,
        description: details.trim() || undefined,
        reportedUserId: reportedUserId.trim() || undefined,
        reportedBikeId: reportedBikeId.trim() || undefined,
      });
      setSuccess(true);
      setReason('');
      setDetails('');
      setReportedUserId('');
      setReportedBikeId('');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Báo cáo vi phạm</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Gửi thông tin vi phạm để đội ngũ kiểm duyệt xử lý nhanh hơn.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              ID người bị báo cáo (tùy chọn)
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
              value={reportedUserId}
              onChange={(e) => setReportedUserId(e.target.value)}
              placeholder="UUID người dùng"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              ID xe liên quan (tùy chọn)
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
              value={reportedBikeId}
              onChange={(e) => setReportedBikeId(e.target.value)}
              placeholder="UUID tin đăng"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Lý do</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Nhập lý do vi phạm"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Chi tiết
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Mô tả chi tiết vi phạm (nếu có)"
          />
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="bg-[#f57224] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#e0651a] disabled:opacity-60"
            disabled={reportMut.isPending}
          >
            {reportMut.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
          {success && (
            <div className="text-green-600 text-sm">
              Gửi báo cáo thành công!
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
      </form>
    </div>
  );
};
