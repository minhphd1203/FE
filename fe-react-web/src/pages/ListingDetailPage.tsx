import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_LISTINGS } from '../constants/data';
import { ChevronLeft } from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const listing = MOCK_LISTINGS.find((item) => String(item.id) === id);

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
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl text-gray-300">🚲</span>
            )}
          </div>

          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <p className="text-xl font-semibold text-[#f57224]">
              {listing.price}
            </p>
            <p className="text-sm text-gray-500">{listing.location}</p>

            <div className="mt-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Đây là trang mô phỏng chi tiết tin đăng. Dữ liệu chỉ mang tính
                minh hoạ để trình bày giao diện Chợ Xe Đạp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
