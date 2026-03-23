import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, MOCK_LISTINGS } from '../constants/data';
import type { BuyerBike } from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { useBuyerRecommendedBikesQuery } from '../hooks/buyer/useBuyerQueries';

export const HomePage: React.FC = () => {
  const {
    data: recommended = [],
    isLoading: loading,
    error: queryError,
  } = useBuyerRecommendedBikesQuery(10);
  const error = queryError
    ? (queryError as Error).message || 'Lỗi không xác định'
    : null;

  return (
    <>
      {/* ========== DANH MỤC (grid icon + text như Chợ Tốt) ========== */}
      <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh mục</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/danh-muc/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <Icon
                  className="w-9 h-9 text-gray-500 shrink-0 group-hover:text-[#f57224] transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#f57224]">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========== TIN ĐĂNG MỚI / NỔI BẬT (card như Chợ Tốt) ========== */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tin đăng gợi ý mới nhất
          </h2>
          <Link
            to="/tat-ca-tin-dang"
            className="text-sm font-medium text-[#f57224] hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommended.map((item) => (
              <Link
                key={item.id}
                to={`/tin-dang/${item.id}`}
                className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getBikeImage(item.images[0], item.title)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => handleBikeImageError(e, item.title)}
                    />
                  ) : (
                    <img
                      src={getBikeImage(undefined, item.title)}
                      alt="Xe dap"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-[#f57224] text-sm mb-1">
                    {item.price?.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </p>
                  <p className="text-gray-800 text-sm line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.seller?.name || item.seller?.email || ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Gợi ý xem thêm */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Nền tảng mua bán xe đạp thể thao uy tín — Kết nối người mua và người bán
      </p>
    </>
  );
};
