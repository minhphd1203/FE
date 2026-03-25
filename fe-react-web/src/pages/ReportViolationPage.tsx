import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * Trang hub “báo cáo”: không trùng form với ListingDetailPage.
 * Có `?bikeId=` → redirect tới chi tiết tin + mở modal báo cáo (`openReport=1`).
 * `sellerId` chỉ để deep-link tương lai; hiện BE cần bike hoặc user — luồng chính qua tin đăng.
 */
export const ReportViolationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bikeId = searchParams.get('bikeId')?.trim();

  if (bikeId) {
    const safe = encodeURIComponent(bikeId);
    return <Navigate to={`/tin-dang/${safe}?openReport=1`} replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Báo cáo vi phạm
        </h1>
        <p className="text-gray-500 mt-2">
          Gửi báo cáo từ trang chi tiết tin đăng, hoặc mở link có mã tin (
          <code className="text-xs bg-gray-100 px-1 rounded">bikeId</code>).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Chọn tin đăng để báo cáo
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-4 leading-relaxed">
          Trên trang chi tiết xe, bấm{' '}
          <strong className="font-medium">Báo cáo</strong> để gửi kèm đúng{' '}
          <code className="text-xs bg-gray-100 px-1">bikeId</code> và ngữ cảnh
          người bán.
        </p>
        <p className="text-gray-400 text-xs max-w-lg mx-auto mb-8">
          Deep link:{' '}
          <code className="break-all text-gray-600">
            /bao-cao-vi-pham?bikeId=&lt;uuid&gt;
          </code>{' '}
          hoặc{' '}
          <code className="break-all text-gray-600">
            /bao-cao?bikeId=&lt;uuid&gt;
          </code>
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          <ShieldCheck className="w-5 h-5 text-gray-400" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};
