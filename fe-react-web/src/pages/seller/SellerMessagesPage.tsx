import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { useSellerMessageThreadsQuery } from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';

export const SellerMessagesPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useSellerMessageThreadsQuery();
  const rows = useMemo(() => unwrapApiList(data), [data]);

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
        <MessageCircle className="w-7 h-7 text-[#f57224]" />
        Hội thoại với người mua
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Tương tác trực tiếp với người mua về các vấn đề trao đổi, hỏi đáp xung
        quanh sản phẩm.
      </p>

      {isLoading && <p className="text-gray-500 text-sm">Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          Không tải được hội thoại.{' '}
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
          Chưa có cuộc hội thoại.
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((item, idx) => {
          const r = asRecord(item) ?? {};
          const partner = asRecord(r.partner) ?? {};
          const partnerId =
            pickStr(r, ['partnerId', 'buyerId', 'userId', 'id']) ||
            pickStr(partner, ['id']);
          const partnerName = String(
            pickStr(partner, ['name', 'email']) ||
              partnerId ||
              'Người mua ẩn danh',
          );

          const bike = asRecord(r.bike) ?? r;
          const bikeId =
            pickStr(r, ['bikeId', 'bike_id']) || pickStr(bike, ['id']);

          const lastMsg = asRecord(r.lastMessage) ?? r;
          const preview = pickStr(lastMsg, [
            'content',
            'preview',
            'lastMessage',
          ]);

          if (!partnerId) return null;
          const q = bikeId ? `?bikeId=${encodeURIComponent(bikeId)}` : '';
          return (
            <li key={`${partnerId}-${idx}`}>
              <Link
                to={`/seller/tin-nhan/${partnerId}${q}`}
                className="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-[#f57224]/40"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Phía mua:{' '}
                  <span className="text-[#f57224]">{partnerName}</span>
                </p>
                {bikeId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sản phẩm tham chiếu: {String(bike?.title || bikeId)}
                  </p>
                )}
                {preview && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {String(preview)}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
