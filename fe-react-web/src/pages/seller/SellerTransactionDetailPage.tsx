import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  useSellerTransactionDetailQuery,
  useSellerUpdateTransactionMutation,
} from '../../hooks/seller/useSellerQueries';

function errMsg(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string } } };
  return ax.response?.data?.message || 'Cập nhật thất bại.';
}

export const SellerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const detailQ = useSellerTransactionDetailQuery(id);
  const updateMut = useSellerUpdateTransactionMutation();
  const [notes, setNotes] = useState('');

  const payload = detailQ.data?.data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller/don-hang"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Danh sách đơn
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Chi tiết đơn hàng
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        GET/PUT{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /seller/v1/transactions/&#123;id&#125;
        </code>
      </p>

      {detailQ.isLoading && <p className="text-gray-500 text-sm">Đang tải…</p>}
      {detailQ.error && (
        <p className="text-red-600 text-sm">Không tải được chi tiết đơn.</p>
      )}

      {payload != null && (
        <>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto mb-6 max-h-[320px] overflow-y-auto">
            {JSON.stringify(payload, null, 2)}
          </pre>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Ghi chú (tuỳ chọn)
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={updateMut.isPending || !id}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                onClick={() => {
                  if (!id) return;
                  void updateMut
                    .mutateAsync({
                      transactionId: id,
                      body: {
                        status: 'completed',
                        ...(notes.trim() ? { notes: notes.trim() } : {}),
                      },
                    })
                    .then(() => detailQ.refetch())
                    .catch((e) => window.alert(errMsg(e)));
                }}
              >
                Đánh dấu hoàn thành
              </button>
              <button
                type="button"
                disabled={updateMut.isPending || !id}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold disabled:opacity-50"
                onClick={() => {
                  if (!id) return;
                  void updateMut
                    .mutateAsync({
                      transactionId: id,
                      body: {
                        status: 'cancelled',
                        ...(notes.trim() ? { notes: notes.trim() } : {}),
                      },
                    })
                    .then(() => detailQ.refetch())
                    .catch((e) => window.alert(errMsg(e)));
                }}
              >
                Hủy đơn
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
