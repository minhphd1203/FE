import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/data';
import { ChevronRight, Home } from 'lucide-react';
import type { BuyerBike } from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { useBuyerSearchBikesQuery } from '../hooks/buyer/useBuyerQueries';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);

  const {
    data: searchResult,
    isLoading: loading,
    error: queryError,
  } = useBuyerSearchBikesQuery(
    {
      keyword: category?.label ?? '',
      page: 1,
      limit: 48,
    },
    { enabled: Boolean(category) },
  );

  const listings: BuyerBike[] = searchResult?.items ?? [];
  const error = queryError
    ? (queryError as Error).message || 'Không tải được danh sách.'
    : null;

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          Không tìm thấy danh mục
        </h2>
        <p className="mb-4 text-gray-500">
          Danh mục bạn đang tìm kiếm không tồn tại.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-[#f57224] px-4 py-2 text-white hover:bg-[#e0651a]"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="flex items-center gap-1 hover:text-[#f57224]">
          <Home className="h-4 w-4" />
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{category.label}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{category.label}</h1>
        {!loading && !error && (
          <span className="text-sm text-gray-500">
            {searchResult?.meta?.total ?? listings.length} tin đăng
          </span>
        )}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-500">Đang tải...</p>
      ) : error ? (
        <p className="py-12 text-center text-red-500">{error}</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((item) => (
            <Link
              key={item.id}
              to={`/tin-dang/${item.id}`}
              className="block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-100">
                {item.images?.[0] || item.image ? (
                  <img
                    src={getBikeImage(
                      item.images?.[0] || item.image,
                      item.title,
                    )}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => handleBikeImageError(e, item.title)}
                  />
                ) : (
                  <img
                    src={getBikeImage(undefined, item.title)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="mb-1 text-sm font-semibold text-[#f57224]">
                  {item.price?.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
                <p className="line-clamp-2 text-sm text-gray-800">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {item.seller?.name || item.seller?.email || ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white py-12 text-center">
          <p className="text-gray-500">
            Chưa có tin đăng phù hợp với danh mục này.
          </p>
          <Link
            to="/tat-ca-tin-dang"
            className="mt-4 inline-block text-sm font-medium text-[#f57224] hover:underline"
          >
            Xem tất cả tin đăng
          </Link>
        </div>
      )}
    </div>
  );
};
