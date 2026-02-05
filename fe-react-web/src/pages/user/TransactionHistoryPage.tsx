import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  {
    id: 'TRX001',
    type: 'deposit',
    amount: 500000,
    status: 'success',
    date: '22/06/2024 14:30',
    desc: 'Nạp tiền vào ví',
  },
  {
    id: 'TRX002',
    type: 'payment',
    amount: 25000,
    status: 'success',
    date: '21/06/2024 09:15',
    desc: 'Thanh toán phí đẩy tin',
  },
  {
    id: 'TRX003',
    type: 'payment',
    amount: 15000,
    status: 'success',
    date: '20/06/2024 18:00',
    desc: 'Thanh toán phí đăng tin VIP',
  },
  {
    id: 'TRX004',
    type: 'deposit',
    amount: 200000,
    status: 'failed',
    date: '19/06/2024 10:00',
    desc: 'Nạp tiền qua MoMo',
  },
];

export const TransactionHistoryPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-[#f57224]" />
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TRANSACTIONS.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {trx.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {trx.type === 'deposit' ? (
                        <div className="p-1 bg-green-100 rounded text-green-600">
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1 bg-red-100 rounded text-red-600">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      )}
                      {trx.type === 'deposit' ? 'Nạp tiền' : 'Chi tiêu'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {trx.desc}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold text-right ${trx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {trx.type === 'deposit' ? '+' : '-'}
                    {new Intl.NumberFormat('vi-VN').format(trx.amount)} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    {trx.status === 'success' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Thành công
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Thất bại
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {trx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
