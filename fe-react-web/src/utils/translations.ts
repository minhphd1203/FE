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
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt (Chờ TT)',
  completed: 'Đã thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

export const BIKE_CONDITION_VNI: Record<string, string> = {
  excellent: 'Xuất sắc',
  good: 'Tốt',
  fair: 'Khá',
  poor: 'Cũ / Cần sửa',
};

export const INSPECTION_DETAIL_VNI: Record<string, string> = {
  // Frame
  perfect: 'Hoàn hảo',
  minor: 'Trầy xước nhỏ',
  damaged: 'Bị biến dạng',
  // Wheels
  new: 'Bánh mới',
  good: 'Bánh tốt',
  worn: 'Bánh mòn, cần thay',
  // Brakes
  working: 'Phanh hoạt động tốt',
  weak: 'Phanh yếu, cần chỉnh',
  broken: 'Phanh hỏng, cần thay',
  // Drivetrain
  smooth: 'Truyền động mượt',
  reasonable: 'Bình thường',
  issues: 'Có trục trặc',
};

export const translateBikeStatus = (status?: string) =>
  status ? BIKE_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateInspectionStatus = (status?: string) =>
  status ? INSPECTION_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateTransactionStatus = (status?: string) =>
  status ? TRANSACTION_STATUS_VNI[status.toLowerCase()] || status : '—';

export const translateBikeCondition = (condition?: string) =>
  condition ? BIKE_CONDITION_VNI[condition.toLowerCase()] || condition : '—';

export const translateInspectionDetail = (detail?: string) =>
  detail ? INSPECTION_DETAIL_VNI[detail.toLowerCase()] || detail : '—';
