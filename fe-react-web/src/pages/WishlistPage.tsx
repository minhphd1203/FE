import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useBuyerRemoveFromWishlistMutation,
  useBuyerWishlistQuery,
} from '../hooks/buyer/useBuyerQueries';

export const WishlistPage: React.FC = () => {
  const {
    data: wishlist = [],
    isLoading: loading,
    error: queryError,
  } = useBuyerWishlistQuery({ page: 1, limit: 50 });
  const removeMut = useBuyerRemoveFromWishlistMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadError =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không thể tải danh sách yêu thích.'
        : '';

  const handleRemove = async (bikeId: string) => {
    setError('');
    setSuccess('');
    try {
      await removeMut.mutateAsync(bikeId);
      setSuccess('Đã xóa khỏi danh sách yêu thích!');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra.',
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Danh sách yêu thích
      </h1>
      <p className="text-sm text-gray-500 mb-5">
        Các tin bạn quan tâm sẽ xuất hiện ở đây để tiện theo dõi.
      </p>
      {(loadError || error) && (
        <div className="text-red-600 text-sm mb-3">{loadError || error}</div>
      )}
      {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
      <div>
        {wishlist.length === 0 ? (
          <div className="text-gray-400 py-8 text-center border border-dashed rounded-xl">
            Chưa có xe nào trong danh sách yêu thích.
          </div>
        ) : (
          <ul className="space-y-3">
            {wishlist.map((item) => {
              const bike = item.bike;
              const bikeId = item.bikeId || bike?.id;
              if (!bikeId) return null;
              return (
                <li
                  key={item.id}
                  className="flex justify-between items-center border border-gray-100 rounded-xl p-4"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/tin-dang/${bikeId}`}
                      className="font-medium text-gray-800 hover:text-[#f57224]"
                    >
                      {bike?.title || bike?.model || bike?.brand || bikeId}
                    </Link>
                    <p className="text-sm text-[#f57224] font-semibold mt-1">
                      {bike?.price != null
                        ? Number(bike.price).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg ml-3"
                    onClick={() => handleRemove(bikeId)}
                    disabled={loading || removeMut.isPending}
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
