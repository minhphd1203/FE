import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useSellerTransactionsQuery } from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';

export const SellerTransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const limit = 10;
  const { data, isLoading, error, refetch } = useSellerTransactionsQuery({
    page,
    limit,
    ...(status ? { status } : {}),
  });

  const rows = useMemo(() => {
    const raw = data?.data;
    return unwrapApiList(raw ?? data);
  }, [data]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Về kênh bán
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Đơn hàng từ người mua
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        GET{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /seller/v1/transactions
        </code>
      </p>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Lọc trạng thái
          </label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg"
          onClick={() => void refetch()}
        >
          Làm mới
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          Không tải được đơn hàng.
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center border border-dashed rounded-xl">
          Chưa có đơn nào.
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((item, idx) => {
          const r = asRecord(item) ?? {};
          const id = pickStr(r, ['id', 'transactionId', '_id']) || `row-${idx}`;
          const st = pickStr(r, ['status']);
          const amount = pickStr(r, ['amount', 'total']);
          return (
            <li key={id}>
              <Link
                to={`/seller/don-hang/${id}`}
                className="flex flex-wrap justify-between gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-[#f57224]/40 transition-colors"
              >
                <span className="font-mono text-xs text-gray-700">{id}</span>
                <span className="text-sm text-gray-600">{st || '—'}</span>
                {amount && (
                  <span className="text-sm font-medium text-[#f57224]">
                    {amount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {rows.length > 0 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>
          <span className="py-2 text-sm text-gray-600">Trang {page}</span>
          <button
            type="button"
            disabled={rows.length < limit}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
