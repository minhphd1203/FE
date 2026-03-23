import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { BuyerBike } from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { useBuyerSearchBikesQuery } from '../hooks/buyer/useBuyerQueries';

export const AllListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || undefined;

  const {
    data: searchResult,
    isLoading: loading,
    error: queryError,
  } = useBuyerSearchBikesQuery({
    keyword,
    page: 1,
    limit: 50,
  });

  const listings: BuyerBike[] = searchResult?.items ?? [];
  const error = queryError
    ? (queryError as Error).message || 'Không tải được danh sách tin đăng.'
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tất cả tin đăng</h1>
        {!loading && !error && (
          <p className="text-sm text-gray-500">
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
