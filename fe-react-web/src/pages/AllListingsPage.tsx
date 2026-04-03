import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { BuyerBike } from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { useBuyerSearchBikesQuery } from '../hooks/buyer/useBuyerQueries';

export const AllListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || undefined;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const {
    data: searchResult,
    isLoading: loading,
    error: queryError,
  } = useBuyerSearchBikesQuery({
    keyword,
    brand: keyword,
    model: keyword,
    sortBy,
    sortOrder,
    page: 1,
    limit: 50,
  });

  const listings: BuyerBike[] = searchResult?.items ?? [];
  const error = queryError
    ? (queryError as Error).message || 'Không tải được danh sách tin đăng.'
    : null;

  const currentSortValue = `${sortBy}_${sortOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);

    if (val === 'createdAt_desc') {
      newParams.set('sortBy', 'createdAt');
      newParams.set('sortOrder', 'desc');
    } else if (val === 'price_asc') {
      newParams.set('sortBy', 'price');
      newParams.set('sortOrder', 'asc');
    } else if (val === 'price_desc') {
      newParams.set('sortBy', 'price');
      newParams.set('sortOrder', 'desc');
    }

    setSearchParams(newParams);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tất cả tin đăng</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              {keyword ? (
                <>
                  Kết quả cho “{keyword}”:{' '}
                  {searchResult?.meta?.total ?? listings.length} tin
                </>
              ) : (
                <>Có {searchResult?.meta?.total ?? listings.length} tin đăng</>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label
            htmlFor="sort-select"
            className="text-sm text-gray-600 font-medium shrink-0"
          >
            Sắp xếp theo:
          </label>
          <select
            id="sort-select"
            value={currentSortValue}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f57224]/50 focus:border-[#f57224] bg-white cursor-pointer"
          >
            <option value="createdAt_desc">Mới nhất</option>
            <option value="price_asc">Giá (Thấp đến cao)</option>
            <option value="price_desc">Giá (Cao xuống thấp)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                    alt="Xe dap"
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
                <p className="mt-1 text-xs text-gray-500">
                  {item.seller?.name || item.seller?.email || ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
