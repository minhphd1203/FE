export const BIKE_STATUS_VNI: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối',
  hidden: 'Đang ẩn',
  sold: 'Đã bán',
  reserved: 'Đang đặt cọc',
};

export const INSPECTION_STATUS_VNI: Record<string, string> = {
  pending: 'Chờ kiểm định',
  in_progress: 'Đang kiểm định',
  completed: 'Đã kiểm định',
  rejected: 'Không đạt',
};

export const TRANSACTION_STATUS_VNI: Record<string, string> = {
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

export const BIKE_CONDITION_VNI: Record<string, string> = {
  excellent: 'Xuất sắc',
  good: 'Tốt',
  fair: 'Khá',
  poor: 'Cũ / Cần sửa',
};

export const translateBikeStatus = (status?: string) =>
  status ? BIKE_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateInspectionStatus = (status?: string) =>
  status ? INSPECTION_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateTransactionStatus = (status?: string) =>
  status ? TRANSACTION_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateBikeCondition = (condition?: string) =>
  condition ? BIKE_CONDITION_VNI[condition.toLowerCase()] || condition : '—';
