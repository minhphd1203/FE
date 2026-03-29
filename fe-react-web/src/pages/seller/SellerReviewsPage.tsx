import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import { useSellerReviewsQuery } from '../../hooks/seller/useSellerQueries';
import { unwrapApiList, asRecord, pickStr } from '../../utils/unwrapApiList';

export const SellerReviewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error, refetch } = useSellerReviewsQuery(
    page,
    limit,
  );

  const { list, extra } = useMemo(() => {
    const root = data?.data;
    if (Array.isArray(root)) {
      return { list: root, extra: null };
    }
    if (root && typeof root === 'object') {
      const o = root as Record<string, unknown>;
      for (const key of ['reviews', 'items', 'rows', 'records']) {
        const v = o[key];
        if (Array.isArray(v)) {
          return { list: v, extra: o };
        }
      }
      return { list: [], extra: o };
    }
    return { list: [] as unknown[], extra: null };
  }, [data]);

  const fallbackList = list.length ? list : unwrapApiList(data);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Về kênh bán
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Star className="w-7 h-7 text-amber-500" />
        Đánh giá từ người mua
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Xem những đánh giá, bình luận của người mua để cải thiện mức độ uy tín
        của gian hàng.
      </p>

      {extra && (
        <pre className="text-xs bg-gray-50 border border-gray-100 p-3 rounded-lg mb-4 overflow-x-auto max-h-40 overflow-y-auto">
          {JSON.stringify(extra, null, 2)}
        </pre>
      )}

      {isLoading && <p className="text-gray-500 text-sm">Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          Không tải được đánh giá.{' '}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void refetch()}
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && fallbackList.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center border border-dashed rounded-xl">
          Chưa có đánh giá.
        </p>
      )}

      <ul className="space-y-3">
        {fallbackList.map((item, idx) => {
          const r = asRecord(item) ?? {};
          const comment = pickStr(r, ['comment', 'content', 'text']);
          const rating = pickStr(r, ['rating', 'score', 'stars']);
          const id = pickStr(r, ['id', '_id']) || `r-${idx}`;
          return (
            <li
              key={id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {rating && (
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  {rating} ★
                </p>
              )}
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {comment || JSON.stringify(item, null, 2)}
              </p>
            </li>
          );
        })}
      </ul>

      {fallbackList.length > 0 && (
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
            disabled={fallbackList.length < limit}
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
