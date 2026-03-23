import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useBuyerTransactionDetailQuery } from '../hooks/buyer/useBuyerQueries';
import { useAppSelector } from '../redux/hooks';

export const BuyerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authed = useAppSelector((s) => s.auth.isAuthenticated);
  const q = useBuyerTransactionDetailQuery(id, { enabled: authed });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/don-mua"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Đơn mua của tôi
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Chi tiết đơn mua
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        GET{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /buyer/v1/transactions/&#123;id&#125;
        </code>
      </p>

      {!authed && (
        <p className="text-amber-800 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Vui lòng{' '}
          <Link to="/auth/login" className="font-semibold underline">
            đăng nhập
          </Link>{' '}
          để xem chi tiết đơn mua.
        </p>
      )}
      {authed && q.isLoading && (
        <p className="text-gray-500 text-sm">Đang tải…</p>
      )}
      {authed && q.error && (
        <p className="text-red-600 text-sm">
          Không tải được chi tiết (mã không hợp lệ hoặc không thuộc tài khoản
          của bạn).
        </p>
      )}
      {authed && q.data != null && !q.isLoading && (
        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto max-h-[480px] overflow-y-auto">
          {JSON.stringify(q.data, null, 2)}
        </pre>
      )}
    </div>
  );
};
