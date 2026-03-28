import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { useBuyerMyReportsQuery } from '../hooks/buyer/useBuyerQueries';

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  resolved: {
    label: 'Đã giải quyết',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700', icon: Ban },
  rejected: { label: 'Từ chối', color: 'bg-red-50 text-red-700', icon: Ban },
};

/**
 * Trang hub “báo cáo”: không trùng form với ListingDetailPage.
 * Có `?bikeId=` → redirect tới chi tiết tin + mở modal báo cáo (`openReport=1`).
 * Không có `bikeId` → Hiển thị lịch sử báo cáo của người dùng.
 */
export const ReportViolationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bikeId = searchParams.get('bikeId')?.trim();

  const { data: reports = [], isLoading } = useBuyerMyReportsQuery();

  if (bikeId) {
    const safe = encodeURIComponent(bikeId);
    return <Navigate to={`/tin-dang/${safe}?openReport=1`} replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Lịch sử báo cáo
        </h1>
        <p className="text-gray-500 mt-2">
          Theo dõi tiến trình và kết quả giải quyết các vi phạm mà bạn đã báo
          cáo.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-0 sm:p-6">
          {isLoading ? (
            <div className="py-20 text-center text-gray-500">
              Đang tải lịch sử báo cáo...
            </div>
          ) : reports.length === 0 ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-xl m-4 sm:m-0">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Chưa có báo cáo nào
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                Bạn chưa gửi báo cáo vi phạm nào trên hệ thống. Trên trang chi
                tiết mỗi chiếc xe, bạn có thể gửi báo cáo nếu phát hiện vi phạm.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Đối tượng bị báo cáo
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Lý do / Nội dung
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">
                      Ghi chú xử lý
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => {
                    const statusObj = STATUS_LABEL[report.status] || {
                      label: report.status,
                      color: 'bg-gray-100 text-gray-700',
                      icon: Clock,
                    };
                    const StatusIcon = statusObj.icon;
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4 align-top whitespace-nowrap text-sm text-gray-500 font-medium whitespace-nowrap">
                          {new Date(report.createdAt).toLocaleDateString(
                            'vi-VN',
                          )}
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(report.createdAt).toLocaleTimeString(
                              'vi-VN',
                              { hour: '2-digit', minute: '2-digit' },
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {report.reportedBike?.title ||
                              report.reportedUser?.name ||
                              'Đối tượng khác'}
                          </div>
                          {report.reportedBike?.title && (
                            <span className="inline-block mt-1 text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                              Tin đăng
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top max-w-[200px]">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {report.reason?.name || 'Lý do khác'}
                          </div>
                          <div
                            className="text-sm text-gray-500 mt-1 line-clamp-2"
                            title={report.description}
                          >
                            {report.description}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusObj.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusObj.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top max-w-[200px]">
                          {report.resolution ? (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              {report.resolution}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
