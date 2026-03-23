import React from 'react';
import { Link } from 'react-router-dom';
import type { BuyerBike } from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { useBuyerSearchBikesQuery } from '../hooks/buyer/useBuyerQueries';

export const AllListingsPage: React.FC = () => {
  const searchParams = { page: 1, limit: 50 } as const;
  const {
    data: rawListings,
    isLoading: loading,
    error: queryError,
  } = useBuyerSearchBikesQuery(searchParams);
  const listings: BuyerBike[] = Array.isArray(rawListings) ? rawListings : [];
  const error = queryError
    ? (queryError as Error).message || 'Không tải được danh sách tin đăng.'
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tất cả tin đăng</h1>
        <p className="text-sm text-gray-500">
          Có {listings.length} tin đăng đang hiển thị
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {listings.map((item) => (
            <Link
              key={item.id}
              to={`/tin-dang/${item.id}`}
              className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.images?.[0] || item.image ? (
                  <img
                    src={getBikeImage(
                      item.images?.[0] || item.image,
                      item.title,
                    )}
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
    </div>
  );
};
