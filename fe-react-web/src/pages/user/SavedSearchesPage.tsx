import React from 'react';
import { Bookmark, Search, Trash2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_SAVED_SEARCHES = [
  {
    id: 1,
    keyword: 'Xe đạp địa hình Giant',
    filters: 'Giá: 5tr - 10tr',
    newDate: '2 tin mới',
  },
  {
    id: 2,
    keyword: 'Xe đạp đua Carbon',
    filters: 'Hồ Chí Minh',
    newDate: null,
  },
  {
    id: 3,
    keyword: 'Phụ kiện Shimano',
    filters: 'Toàn quốc',
    newDate: '5 tin mới',
  },
];

export const SavedSearchesPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-8 h-8 text-[#f57224] fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm đã lưu</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {MOCK_SAVED_SEARCHES.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {MOCK_SAVED_SEARCHES.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {item.keyword}
                    </h3>
                    {item.newDate && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                        {item.newDate}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.filters}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-[#f57224] transition-colors"
                    title="Nhận thông báo"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                  <Link
                    to={`/tim-kiem?q=${encodeURIComponent(item.keyword)}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Tìm kiếm ngay"
                  >
                    <Search className="w-5 h-5" />
                  </Link>
                  <button
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Bạn chưa lưu tìm kiếm nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};
