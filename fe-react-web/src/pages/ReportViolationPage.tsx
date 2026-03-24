import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const ReportViolationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Lịch sử báo cáo
        </h1>
        <p className="text-gray-500 mt-2">
          Theo dõi các báo cáo vi phạm bạn đã gửi cho ban quản trị.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Bạn chưa gửi báo cáo nào
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Nếu phát hiện người bán lừa đảo hoặc xe không đúng thực tế, bạn có thể
          bấm vào nút <strong className="font-medium">"Báo cáo"</strong> ở trang
          chi tiết tin đăng.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          <ShieldCheck className="w-5 h-5 text-gray-400" />
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};
