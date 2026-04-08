import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import type { AdminReport } from '../../apis/adminApi';
import {
  useAdminReportsQuery,
  useAdminResolveReportMutation,
  useAdminSendMessageMutation,
  useAdminCloseConversationMutation,
} from '../../hooks/admin/useAdminQueries';
import { buildMessageFormData } from '../../utils/messageFormData';
import {
  Search,
  Filter,
  CheckCircle,
  ShieldOff,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
  Ban,
  PhoneOff,
} from 'lucide-react';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700' },
  rejected: { label: 'Từ chối', color: 'bg-red-50 text-red-700' },
};

function reportReasonSummary(report: AdminReport): string {
  const t =
    report.reasonText?.trim() ||
    (typeof report.reason === 'string'
      ? report.reason.trim()
      : report.reason?.description?.trim()) ||
    report.description?.trim();
  if (t) return t.length > 120 ? `${t.slice(0, 120)}…` : t;
  return report.reasonId?.trim() || '—';
}

const formatDate = (date?: string | null) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString('vi-VN');
  } catch {
    return date;
  }
};

type ReportHistoryItem = {
  title: string;
  when: string;
  detail?: string;
};

type ReportDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AdminReport | null;
  onResolve: (
    report: AdminReport,
    status: 'resolved' | 'closed' | 'rejected',
    resolution: string,
  ) => Promise<void>;
  onMessageUser: (report: AdminReport, target: 'reporter' | 'reported') => void;
  onCloseConversation: (
    report: AdminReport,
    target: 'reporter' | 'reported',
  ) => void;
  isBusy: boolean;
};

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  open,
  onOpenChange,
  report,
  onResolve,
  onMessageUser,
  onCloseConversation,
  isBusy,
}) => {
  const [resolution, setResolution] = useState('');
  const [tabValue, setTabValue] = useState<'details' | 'history'>('details');

  React.useEffect(() => {
    if (open) {
      setResolution(report?.resolution ?? '');
      setTabValue('details');
    }
  }, [open, report]);

  if (!report) return null;

  const history: ReportHistoryItem[] = [
    {
      title: 'Báo cáo được gửi',
      when: report.createdAt,
      detail: reportReasonSummary(report),
    },
  ];

  if (report.status !== 'pending') {
    const title =
      report.status === 'resolved'
        ? 'Báo cáo được giải quyết'
        : report.status === 'rejected'
          ? 'Báo cáo bị từ chối'
          : 'Báo cáo được đóng';
    history.push({
      title,
      when: report.updatedAt ?? report.resolvedAt ?? report.createdAt,
      detail: report.resolution || 'Không có nội dung',
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Chi tiết báo cáo
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">
                Xem thông tin chi tiết và lịch sử xử lý báo cáo.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="mt-6">
            <Tabs.Root
              value={tabValue}
              onValueChange={(value) => setTabValue(value as any)}
              className="flex flex-col"
            >
              <Tabs.List className="flex gap-2 border-b border-gray-200">
                <Tabs.Trigger
                  value="details"
                  className="px-4 py-2 text-sm font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[#f57224]"
                >
                  Thông tin
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="history"
                  className="px-4 py-2 text-sm font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[#f57224]"
                >
                  Lịch sử xử lý
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="details" className="mt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Mã báo cáo
                    </div>
                    <div className="mt-1 text-sm font-medium font-mono text-[#f57224]">
                      #{report.id.substring(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Trạng thái
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_LABEL[report.status]?.color ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_LABEL[report.status]?.label ?? report.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Người báo cáo
                    </div>
                    <div className="mt-1 text-sm text-gray-900">
                      {report.reporter?.name ?? '—'}
                      <div className="text-xs text-gray-500">
                        {report.reporter?.email ?? ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Đối tượng bị báo cáo
                    </div>
                    <div className="mt-1 text-sm text-gray-900">
                      {report.reportedUser?.name ? (
                        <>
                          {report.reportedUser.name}
                          <div className="text-xs text-gray-500">
                            {report.reportedUser.email}
                          </div>
                        </>
                      ) : report.reportedBike?.title ? (
                        <span>{report.reportedBike.title}</span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Lý do / mô tả
                    </div>
                    <div className="mt-1 text-sm text-gray-900 space-y-1">
                      {report.reasonId && (
                        <p className="text-xs text-gray-500 font-mono">
                          reasonId: {report.reasonId}
                        </p>
                      )}
                      {report.reasonText && (
                        <p className="whitespace-pre-wrap">
                          Lý do (text): {report.reasonText}
                        </p>
                      )}
                      {report.reason && (
                        <p className="whitespace-pre-wrap">{report.reason}</p>
                      )}
                      {report.description && (
                        <p className="whitespace-pre-wrap text-gray-700">
                          {report.description}
                        </p>
                      )}
                      {!report.reasonText &&
                        !report.reason &&
                        !report.description &&
                        '—'}
                    </div>
                  </div>
                  <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ngày tạo
                      </div>
                      <div className="mt-1 text-sm text-gray-900">
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Cập nhật lần cuối
                      </div>
                      <div className="mt-1 text-sm text-gray-900">
                        {formatDate(report.updatedAt)}
                      </div>
                    </div>
                  </div>
                  {report.resolvedAt && (
                    <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Ngày giải quyết
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          {formatDate(report.resolvedAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Người xử lý
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          {report.resolver?.name ?? '—'}
                        </div>
                      </div>
                    </div>
                  )}
                  {report.resolution && (
                    <div className="sm:col-span-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ghi chú xử lý
                      </div>
                      <div className="mt-1 text-sm text-gray-900">
                        {report.resolution}
                      </div>
                    </div>
                  )}
                </div>
              </Tabs.Content>

              <Tabs.Content value="history" className="mt-5">
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={`${item.title}-${item.when}`}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.when)}
                          </div>
                        </div>
                        {item.detail && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            <Info className="w-3 h-3" />
                            Chi tiết
                          </span>
                        )}
                      </div>
                      {item.detail && (
                        <div className="mt-2 text-sm text-gray-700">
                          {item.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>

          {report.status === 'pending' && (
            <div className="mt-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ghi chú xử lý (resolution)
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#f57224] focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
                rows={3}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Nội dung gửi kèm khi giải quyết, từ chối hoặc đóng báo cáo…"
              />
            </div>
          )}

          <div className="mt-5 border-t border-gray-100 pt-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
              Hỗ trợ & Liên hệ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!report.reporter?.id}
                onClick={() => onMessageUser(report, 'reporter')}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                Nhắn người mua
              </button>
              <button
                type="button"
                disabled={!report.reportedUser?.id}
                onClick={() => onMessageUser(report, 'reported')}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                Nhắn người bán
              </button>
              <button
                type="button"
                disabled={!report.reporter?.id}
                onClick={() => onCloseConversation(report, 'reporter')}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <PhoneOff className="w-4 h-4" />
                Khóa nhắn tin (buyer)
              </button>
              <button
                type="button"
                disabled={!report.reportedUser?.id}
                onClick={() => onCloseConversation(report, 'reported')}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <PhoneOff className="w-4 h-4" />
                Khóa nhắn tin (seller)
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-gray-100 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={isBusy || report.status !== 'pending'}
                onClick={() =>
                  onResolve(
                    report,
                    'resolved',
                    resolution.trim() || 'Đã giải quyết',
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Giải quyết
              </button>
              <button
                type="button"
                disabled={isBusy || report.status !== 'pending'}
                onClick={() =>
                  onResolve(
                    report,
                    'rejected',
                    resolution.trim() || 'Từ chối báo cáo',
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Từ chối
              </button>
              <button
                type="button"
                disabled={isBusy || report.status !== 'pending'}
                onClick={() =>
                  onResolve(report, 'closed', resolution || 'Đóng báo cáo')
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                <ShieldOff className="w-4 h-4" />
                Đóng
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const AdminReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'resolved' | 'closed' | 'rejected'
  >('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgTarget, setMsgTarget] = useState<{
    userId: string;
    bikeId?: string;
    title: string;
  } | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [msgFile, setMsgFile] = useState<File | null>(null);

  const itemsPerPage = 10;

  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useAdminReportsQuery(filterStatus);
  const resolveMut = useAdminResolveReportMutation();
  const sendMsgMut = useAdminSendMessageMutation();
  const closeConvMut = useAdminCloseConversationMutation();

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return reports.filter((report) => {
      if (!term) return true;
      const reasonStr =
        typeof report.reason === 'string'
          ? report.reason
          : report.reason?.name || report.reason?.description || '';
      const hay = [
        reasonStr,
        report.reasonText,
        report.description,
        report.reasonId,
        report.reporter?.name,
        report.reportedUser?.name,
        report.reportedBike?.title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [reports, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleOpenDetails = (report: AdminReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleResolve = async (
    report: AdminReport,
    status: 'resolved' | 'closed' | 'rejected',
    resolution: string,
  ) => {
    setActiveId(report.id);
    try {
      await resolveMut.mutateAsync({
        reportId: report.id,
        resolution,
        status,
      });
      await refetch();
      setIsModalOpen(false);
    } catch {
      // ignore
    } finally {
      setActiveId(null);
    }
  };

  const openMessageToUser = (
    report: AdminReport,
    target: 'reporter' | 'reported',
  ) => {
    const userId =
      target === 'reporter' ? report.reporter?.id : report.reportedUser?.id;
    if (!userId) return;
    const bikeId =
      report.reportedBike?.id ?? report.reportedBikeId ?? undefined;
    setMsgTarget({
      userId,
      bikeId: bikeId?.trim() || undefined,
      title:
        target === 'reporter'
          ? 'Người báo cáo (buyer)'
          : 'Người bị báo cáo (seller)',
    });
    setMsgContent('');
    setMsgFile(null);
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTarget || !msgContent.trim()) return;
    try {
      const fd = buildMessageFormData({
        content: msgContent.trim(),
        bikeId: msgTarget.bikeId,
        attachment: msgFile,
      });
      await sendMsgMut.mutateAsync({ userId: msgTarget.userId, formData: fd });
      setMsgTarget(null);
      setMsgContent('');
      setMsgFile(null);
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      window.alert(
        ax.response?.data?.message ||
          (ax.response?.status
            ? `Gửi tin thất bại (${ax.response.status}).`
            : 'Gửi tin thất bại.'),
      );
    }
  };

  const handleCloseConversation = async (
    report: AdminReport,
    target: 'reporter' | 'reported',
  ) => {
    const userId =
      target === 'reporter' ? report.reporter?.id : report.reportedUser?.id;
    if (!userId) return;
    if (
      !window.confirm(
        'Đóng hội thoại với người này? Buyer/seller sẽ không gửi tin tiếp tới admin.',
      )
    ) {
      return;
    }
    try {
      await closeConvMut.mutateAsync(userId);
      window.alert('Đã gửi yêu cầu đóng hội thoại.');
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (status === 404) {
        window.alert(
          'Chưa có tin nhắn nào giữa admin và người dùng này — không thể đóng hội thoại (404).',
        );
      } else {
        window.alert(
          msg ||
            (status
              ? `Không thể đóng hội thoại (${status}).`
              : 'Không thể đóng hội thoại.'),
        );
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      <Dialog.Root
        open={Boolean(msgTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setMsgTarget(null);
            setMsgContent('');
            setMsgFile(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Gửi tin nhắn — {msgTarget?.title}
            </Dialog.Title>
            <p className="mt-1 text-xs text-gray-500 break-all">
              userId: {msgTarget?.userId}
              {msgTarget?.bikeId && (
                <>
                  <br />
                  bikeId: {msgTarget.bikeId}
                </>
              )}
            </p>
            <form onSubmit={handleSendAdminMessage} className="mt-4 space-y-3">
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px]"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Nội dung (bắt buộc)…"
                required
              />
              <div>
                <label className="text-xs text-gray-600">
                  Đính kèm (tuỳ chọn)
                </label>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm"
                  accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
                  onChange={(e) => setMsgFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                  >
                    Huỷ
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={sendMsgMut.isPending || !msgContent.trim()}
                  className="rounded-lg bg-[#f57224] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {sendMsgMut.isPending ? 'Đang gửi…' : 'Gửi'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ReportDetailsModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedReport(null);
        }}
        report={selectedReport}
        onResolve={handleResolve}
        onMessageUser={openMessageToUser}
        onCloseConversation={handleCloseConversation}
        isBusy={Boolean(activeId)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
          <p className="text-gray-500 mt-1">
            Xem và xử lý các báo cáo vi phạm trong hệ thống.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo người báo cáo, người bị báo cáo, hoặc nội dung..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã báo cáo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người bị báo cáo / Xe
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-red-600 font-semibold">
                        Lỗi tải báo cáo
                      </p>
                      <p className="text-sm text-red-500">
                        {error instanceof Error
                          ? error.message
                          : 'Có lỗi xảy ra'}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy báo cáo
                  </td>
                </tr>
              ) : (
                pagedReports.map((report) => {
                  const status = STATUS_LABEL[report.status] ?? {
                    label: report.status,
                    color: 'bg-gray-100 text-gray-700',
                  };

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm font-medium font-mono text-[#f57224]">
                        #{report.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {report.reporter?.name ?? '—'}
                        <div className="text-xs text-gray-500">
                          {report.reporter?.email ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {report.reportedUser?.name ? (
                          <>
                            {report.reportedUser.name}
                            <div className="text-xs text-gray-500">
                              {report.reportedUser.email}
                            </div>
                          </>
                        ) : report.reportedBike?.title ? (
                          <span>{report.reportedBike.title}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[220px]">
                        <span className="line-clamp-2">
                          {reportReasonSummary(report)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col sm:flex-row items-end justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(report)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Info className="w-4 h-4" />
                            Chi tiết
                          </button>
                          <button
                            disabled={
                              report.status !== 'pending' ||
                              activeId === report.id
                            }
                            onClick={() =>
                              handleResolve(
                                report,
                                'resolved',
                                report.resolution ?? '',
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Giải quyết</span>
                          </button>
                          <button
                            disabled={
                              report.status !== 'pending' ||
                              activeId === report.id
                            }
                            onClick={() =>
                              handleResolve(
                                report,
                                'rejected',
                                report.resolution ?? 'Từ chối báo cáo',
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                          <button
                            disabled={
                              report.status !== 'pending' ||
                              activeId === report.id
                            }
                            onClick={() =>
                              handleResolve(report, 'closed', 'Đóng báo cáo')
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <ShieldOff className="w-4 h-4" />
                            <span>Đóng</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị{' '}
            {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} -{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} trong tổng
            số {filtered.length} báo cáo
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      page === currentPage
                        ? 'bg-[#f57224] text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
