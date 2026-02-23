import React, { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageSquare,
  Clock,
} from 'lucide-react';

// Mock data
const MOCK_REPORTS = [
  {
    id: '1',
    type: 'listing' as const,
    reason: 'San pham gia mao',
    description:
      'Tin dang nay su dung hinh anh tu internet va gia ca qua thap so voi thi truong',
    reporter: 'Nguyen Van A',
    reportedItem: 'Xe dap Pinarello F12 gia re',
    reportedUser: 'Tran Van X',
    status: 'pending' as const,
    createdAt: '2024-06-23T10:30:00',
  },
  {
    id: '2',
    type: 'user' as const,
    reason: 'Lua dao nguoi mua',
    description: 'Nguoi ban nay da nhan tien nhung khong giao hang cho toi',
    reporter: 'Le Thi B',
    reportedItem: null,
    reportedUser: 'Pham Van Y',
    status: 'investigating' as const,
    createdAt: '2024-06-22T15:45:00',
  },
  {
    id: '3',
    type: 'listing' as const,
    reason: 'Noi dung khong phu hop',
    description: 'Tin dang chua noi dung khong lien quan den xe dap',
    reporter: 'Hoang Van C',
    reportedItem: 'Dien thoai iPhone 15 Pro Max',
    reportedUser: 'Nguyen Van Z',
    status: 'resolved' as const,
    createdAt: '2024-06-21T09:15:00',
  },
  {
    id: '4',
    type: 'user' as const,
    reason: 'Ngon tu khong dung muc',
    description: 'Nguoi dung nay da co ngon tu xuc pham trong tin nhan',
    reporter: 'Vu Thi D',
    reportedItem: null,
    reportedUser: 'Le Van W',
    status: 'pending' as const,
    createdAt: '2024-06-20T14:20:00',
  },
  {
    id: '5',
    type: 'listing' as const,
    reason: 'Gia khong chinh xac',
    description: 'Gia niem yet khac voi gia thuc te nguoi ban yeu cau',
    reporter: 'Tran Van E',
    reportedItem: 'Xe dap Giant Talon 3',
    reportedUser: 'Hoang Van V',
    status: 'dismissed' as const,
    createdAt: '2024-06-19T11:00:00',
  },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'listing':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Tin dang
        </span>
      );
    case 'user':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Nguoi dung
        </span>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Cho xu ly
        </span>
      );
    case 'investigating':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Eye className="w-3 h-3" />
          Dang xem xet
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Da xu ly
        </span>
      );
    case 'dismissed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <XCircle className="w-3 h-3" />
          Bac bo
        </span>
      );
    default:
      return null;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AdminReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const filteredReports = MOCK_REPORTS.filter((report) => {
    const matchSearch =
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || report.type === filterType;
    const matchStatus =
      filterStatus === 'all' || report.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = MOCK_REPORTS.filter(
    (r) => r.status === 'pending',
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bao cao vi pham</h1>
          <p className="text-gray-500 mt-1">
            Xu ly cac bao cao vi pham tu nguoi dung
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-medium rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            {pendingCount} bao cao can xu ly
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_REPORTS.filter((r) => r.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-500">Cho xu ly</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {
                  MOCK_REPORTS.filter((r) => r.status === 'investigating')
                    .length
                }
              </p>
              <p className="text-xs text-gray-500">Dang xem xet</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_REPORTS.filter((r) => r.status === 'resolved').length}
              </p>
              <p className="text-xs text-gray-500">Da xu ly</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_REPORTS.filter((r) => r.status === 'dismissed').length}
              </p>
              <p className="text-xs text-gray-500">Bac bo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tim kiem theo ly do, nguoi bao cao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tat ca loai</option>
              <option value="listing">Tin dang</option>
              <option value="user">Nguoi dung</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
          >
            <option value="all">Tat ca trang thai</option>
            <option value="pending">Cho xu ly</option>
            <option value="investigating">Dang xem xet</option>
            <option value="resolved">Da xu ly</option>
            <option value="dismissed">Bac bo</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-200 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flag className="w-6 h-6 text-red-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {getTypeBadge(report.type)}
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-gray-400">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {report.reason}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {report.description}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Nguoi bao cao:</span>{' '}
                    {report.reporter}
                  </div>
                  <div>
                    <span className="font-medium">Bi bao cao:</span>{' '}
                    {report.reportedUser}
                  </div>
                  {report.reportedItem && (
                    <div>
                      <span className="font-medium">Tin dang:</span>{' '}
                      {report.reportedItem}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() =>
                    setOpenActionMenu(
                      openActionMenu === report.id ? null : report.id,
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>

                {openActionMenu === report.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenActionMenu(null)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                          Xem chi tiet
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <MessageSquare className="w-4 h-4" />
                          Lien he nguoi bao cao
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                              Bat dau xem xet
                            </button>
                          </>
                        )}
                        {(report.status === 'pending' ||
                          report.status === 'investigating') && (
                          <>
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                              Danh dau da xu ly
                            </button>
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                              <XCircle className="w-4 h-4" />
                              Bac bo bao cao
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Hien thi 1-{filteredReports.length} trong tong so{' '}
          {MOCK_REPORTS.length} bao cao
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 bg-[#f57224] text-white text-sm font-medium rounded-lg">
            1
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
