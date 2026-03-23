import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  useSellerMyOffersQuery,
  useSellerRespondToOfferMutation,
} from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';

function errMsg(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string } } };
  return ax.response?.data?.message || 'Thao tác thất bại.';
}

export const SellerOffersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const {
    data: raw,
    isLoading,
    error,
    refetch,
  } = useSellerMyOffersQuery(page, limit);
  const respondMut = useSellerRespondToOfferMutation();
  const [counterById, setCounterById] = useState<Record<string, string>>({});

  const rows = useMemo(() => unwrapApiList(raw), [raw]);

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
        Đề nghị mua / trả giá
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        GET{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /seller/v1/offers
        </code>
        — chấp nhận hoặc từ chối qua POST{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /seller/v1/offers/&#123;id&#125;/respond
        </code>
      </p>

      {isLoading && (
        <p className="text-gray-500 text-sm">Đang tải danh sách đề nghị…</p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          Không tải được đề nghị.{' '}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void refetch()}
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center border border-dashed rounded-xl">
          Chưa có đề nghị nào.
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((item, idx) => {
          const r = asRecord(item) ?? {};
          const id = pickStr(r, ['id', 'offerId', '_id']) || `idx-${idx}`;
          const bikeId = pickStr(r, ['bikeId', 'bike_id', 'listingId']);
          const price = pickStr(r, ['offerPrice', 'price', 'amount']);
          const status = pickStr(r, ['status', 'state']) || '—';
          const counter = counterById[id] ?? '';

          return (
            <li
              key={id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Mã đề nghị:</span>{' '}
                    <span className="font-mono text-xs">{id}</span>
                  </p>
                  {bikeId && (
                    <p>
                      <span className="text-gray-500">Tin:</span>{' '}
                      <Link
                        to={`/seller/tin-dang/${bikeId}`}
                        className="text-[#f57224] font-medium hover:underline"
                      >
                        {bikeId}
                      </Link>
                    </p>
                  )}
                  {price && (
                    <p>
                      <span className="text-gray-500">Giá đề xuất:</span>{' '}
                      <span className="font-semibold">{price}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Trạng thái:</span> {status}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Giá phản hồi (tuỳ chọn)"
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2"
                    value={counter}
                    onChange={(e) =>
                      setCounterById((m) => ({ ...m, [id]: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={respondMut.isPending}
                      className="flex-1 min-w-[5rem] rounded-lg bg-emerald-600 text-white text-xs font-semibold py-2 hover:bg-emerald-700 disabled:opacity-50"
                      onClick={() => {
                        const n = counter.replace(/\./g, '').replace(/\s/g, '');
                        const num = n ? Number(n) : undefined;
                        void respondMut
                          .mutateAsync({
                            offerId: id,
                            action: 'accept',
                            counterOffer:
                              num != null && !Number.isNaN(num) && num > 0
                                ? num
                                : undefined,
                          })
                          .then(() => refetch())
                          .catch((e) => window.alert(errMsg(e)));
                      }}
                    >
                      Chấp nhận
                    </button>
                    <button
                      type="button"
                      disabled={respondMut.isPending}
                      className="flex-1 min-w-[5rem] rounded-lg border border-red-200 text-red-700 text-xs font-semibold py-2 hover:bg-red-50 disabled:opacity-50"
                      onClick={() => {
                        void respondMut
                          .mutateAsync({ offerId: id, action: 'reject' })
                          .then(() => refetch())
                          .catch((e) => window.alert(errMsg(e)));
                      }}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
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
            Trang trước
          </button>
          <span className="py-2 text-sm text-gray-600">Trang {page}</span>
          <button
            type="button"
            disabled={rows.length < limit}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
