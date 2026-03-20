import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  addToWishlist,
  createTransaction,
  getBikeDetails,
  type BuyerBike,
} from '../api/buyerApi';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<BuyerBike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getBikeDetails(id);
        setListing(data);
      } catch (err: any) {
        setError(err?.message || 'Không tải được chi tiết tin đăng.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Đang tải...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-red-500">{error}</div>;
  }

  if (!listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-700 mb-4">
          Không tìm thấy tin đăng bạn yêu cầu.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f57224] text-white text-sm font-medium hover:bg-[#e0651a] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Về trang chủ
        </Link>
      </div>
    );
  }

  const handleAddWishlist = async () => {
    if (!listing?.id) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await addToWishlist(listing.id);
      setActionMessage('Đã thêm vào danh sách yêu thích.');
    } catch (err: any) {
      setActionMessage(
        err?.response?.data?.message || 'Không thể thêm yêu thích.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!listing?.id) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await createTransaction({
        bikeId: listing.id,
        amount: listing.price || 0,
      });
      setActionMessage('Đặt mua thành công. Kiểm tra mục Đơn mua của tôi.');
    } catch (err: any) {
      setActionMessage(
        err?.response?.data?.message || 'Không thể tạo đơn mua.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại trang chủ
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-gray-100 flex items-center justify-center">
            {listing.images?.[0] || listing.image ? (
              <img
                src={getBikeImage(
                  listing.images?.[0] || listing.image,
                  listing.title,
                )}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => handleBikeImageError(e, listing.title)}
              />
            ) : (
              <img
                src={getBikeImage(undefined, listing.title)}
                alt="Xe dap"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <p className="text-xl font-semibold text-[#f57224]">
              {listing.price?.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </p>
            <p className="text-sm text-gray-500">
              Người bán: {listing.seller?.name || listing.seller?.email || '—'}
            </p>

            <div className="mt-4 text-sm text-gray-600 leading-relaxed">
              <p>{listing.description || 'Không có mô tả cho tin đăng này.'}</p>
            </div>
            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={handleAddWishlist}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-[#f57224] text-[#f57224] font-medium hover:bg-orange-50 disabled:opacity-60"
              >
                Yêu thích
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-[#f57224] text-white font-medium hover:bg-[#e0651a] disabled:opacity-60"
              >
                Đặt mua
              </button>
            </div>
            {actionMessage && (
              <p className="text-sm text-gray-600 pt-1">{actionMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
