import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Package,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { useSellerTransactionsQuery } from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';
import { resolveBikeMediaUrl } from '../../apis/sellerApi';

function getStatusInfo(st: string) {
  switch (st) {
    case 'pending':
      return {
        label: 'Chờ xác nhận',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock className="w-4 h-4" />,
      };
    case 'approved':
      return {
        label: 'Đã chấp nhận',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case 'completed':
      return {
        label: 'Thành công',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle className="w-4 h-4" />,
      };
    default:
      return {
        label: st || 'Không rõ',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <Package className="w-4 h-4" />,
      };
  }
}

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
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] transition-colors mb-6 group"
      >
        <div className="p-1 rounded-full bg-gray-100 group-hover:bg-[#f57224]/10 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Về kênh bán
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#f57224]" />
          Đơn hàng từ người mua
        </h1>
        <p className="text-gray-500 text-base">
          Theo dõi trạng thái các đơn hàng đã được tạo từ bài đăng của bạn.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-end justify-between">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo trạng thái
          </label>
          <select
            className="w-full sm:w-64 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] transition-all"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">⏳ Chờ xác nhận</option>
            <option value="approved">✅ Đã chấp nhận</option>
            <option value="completed">🎉 Thành công</option>
            <option value="cancelled">❌ Đã hủy</option>
          </select>
        </div>
        <button
          type="button"
          className="px-6 py-2.5 text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors shadow-sm"
          onClick={() => void refetch()}
        >
          Làm mới
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#f57224] animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải đơn hàng…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-center gap-4">
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold mb-1">
              Không tải được đơn hàng
            </h3>
            <p className="text-red-600 text-sm">
              Vui lòng kiểm tra lại kết nối hoặc tải lại trang.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-3xl">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-gray-500">
            Thử làm mới hoặc thay đổi bộ lọc trạng thái.
          </p>
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {rows.map((item, idx) => {
          const r = asRecord(item) ?? {};
          const id = pickStr(r, ['id', 'transactionId', '_id']) || `row-${idx}`;
          const st = pickStr(r, ['status']);
          const amountStr = pickStr(r, ['amount', 'total']);
          const amountNum = amountStr ? Number(amountStr) : 0;

          const bikeObj = asRecord(r.bike) ?? {};
          const bikeTitle =
            pickStr(bikeObj, ['title', 'name']) || 'Sản phẩm không rõ';

          let bikeImage = '';
          const images = bikeObj.images;
          if (Array.isArray(images) && images.length > 0) {
            bikeImage = typeof images[0] === 'string' ? images[0] : '';
          }

          const buyerObj = asRecord(r.buyer) ?? {};
          const buyerName =
            pickStr(buyerObj, ['name', 'email']) || 'Người mua ẩn danh';

          const createdAt = pickStr(r, ['createdAt', 'created_at']);
          const dateStr = createdAt
            ? new Date(createdAt).toLocaleDateString('vi-VN')
            : '';

          const statusInfo = getStatusInfo(st);

          return (
            <li key={id}>
              <Link
                to={`/seller/don-hang/${id}`}
                className="group flex flex-col h-full rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#f57224]/30 transition-all overflow-hidden"
              >
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                        {bikeImage ? (
                          <img
                            src={resolveBikeMediaUrl(bikeImage)}
                            alt={bikeTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#f57224] transition-colors"
                          title={bikeTitle}
                        >
                          {bikeTitle}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          mã GD: #{id.split('-')[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-amber-50/30 transition-colors">
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Khách hàng
                      </p>
                      <p
                        className="font-medium text-gray-900 line-clamp-1"
                        title={buyerName}
                      >
                        {buyerName}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-amber-50/30 transition-colors">
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Đặt lúc
                      </p>
                      <p className="font-medium text-gray-900">
                        {dateStr || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                  {amountNum > 0 ? (
                    <span className="text-base font-bold text-[#f57224]">
                      {amountNum.toLocaleString('vi-VN')} đ
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">
                      Chưa có giá
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {rows.length > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            className="px-4 py-2.5 text-sm font-medium border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </button>
          <div className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl border border-gray-100 min-w-[3rem]">
            {page}
          </div>
          <button
            type="button"
            disabled={rows.length < limit}
            className="px-4 py-2.5 text-sm font-medium border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
