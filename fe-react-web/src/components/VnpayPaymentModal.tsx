import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  QrCode,
  RefreshCw,
  Clock,
} from 'lucide-react';
import type { PaymentCreateData } from '../apis/paymentApi';

type VnpayPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  /** POST create hoặc create-remaining — chỉ gọi khi đơn đủ điều kiện (approved / cọc completed). */
  requestPayment: (opts: {
    bankCode: string;
    language: string;
  }) => Promise<{ data: PaymentCreateData }>;
  /** Sau khi có QR/link — ví dụ refetch chi tiết đơn hoặc danh sách. */
  onAfterPaymentCreated?: () => void;
};

function formatExpiresAt(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function getErrorMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string } } };
  const m = ax.response?.data?.message;
  if (typeof m === 'string' && m.trim()) return m;
  if (err instanceof Error && err.message) return err.message;
  return 'Không tạo được thanh toán. Kiểm tra đơn đã được duyệt (approved) và thử lại.';
}

export const VnpayPaymentModal: React.FC<VnpayPaymentModalProps> = ({
  open,
  onClose,
  isPending,
  requestPayment,
  onAfterPaymentCreated,
}) => {
  const [phase, setPhase] = useState<'options' | 'qr'>('options');
  const [bankCode, setBankCode] = useState('');
  const [language, setLanguage] = useState('vn');
  const [result, setResult] = useState<PaymentCreateData | null>(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) {
      setPhase('options');
      setResult(null);
      setLocalError('');
      setBankCode('');
      setLanguage('vn');
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = async () => {
    setLocalError('');
    try {
      const res = await requestPayment({ bankCode, language });
      const data = res?.data;
      if (!data?.paymentUrl) {
        setLocalError('Phản hồi không có link thanh toán (paymentUrl).');
        return;
      }
      setResult(data);
      setPhase('qr');
      onAfterPaymentCreated?.();
    } catch (e: unknown) {
      setLocalError(getErrorMessage(e));
    }
  };

  const openVnpay = () => {
    if (result?.paymentUrl) {
      window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vnpay-modal-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h3
              id="vnpay-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              {phase === 'options'
                ? 'Thanh toán VNPay'
                : 'Quét QR hoặc mở VNPay'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {phase === 'options'
                ? 'Chọn ngân hàng / ngôn ngữ rồi tạo mã. Chỉ gọi API khi đơn đã approved (hoặc cọc đã completed khi trả số dư).'
                : 'QR do backend tạo, trùng nội dung với link thanh toán.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>

        <div className="px-5 py-4">
          {(localError || (phase === 'qr' && !result?.qrCode)) && (
            <div
              className={`mb-4 flex gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                localError
                  ? 'border-red-100 bg-red-50 text-red-700'
                  : 'border-amber-100 bg-amber-50 text-amber-900'
              }`}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {localError ||
                  'Backend không trả qrCode — vẫn có thể thanh toán bằng nút “Mở VNPay”. Kiểm tra network / log nếu cần.'}
              </p>
            </div>
          )}

          {phase === 'options' && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Ngân hàng / cổng (tuỳ chọn)
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#f57224] focus:ring-2 focus:ring-[#f57224]/20"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                  >
                    <option value="">Gateway mặc định</option>
                    <option value="VNPAYQR">VNPAYQR</option>
                    <option value="VNBANK">ATM / nội địa (VNBANK)</option>
                    <option value="INTCARD">Thẻ quốc tế</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Ngôn ngữ
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#f57224] focus:ring-2 focus:ring-[#f57224]/20"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="vn">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-[#f57224] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#e0651a] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang tạo…
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Tạo QR & link
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {phase === 'qr' && result && (
            <div className="space-y-4">
              {result.qrCode ? (
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-center text-xs font-medium text-gray-500">
                    Quét bằng app ngân hàng hoặc VNPay
                  </p>
                  <img
                    src={result.qrCode}
                    alt="QR thanh toán VNPay"
                    className="max-h-64 w-64 max-w-full rounded-lg border border-white bg-white p-2 shadow-sm"
                  />
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  {Number(result.amount).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
                {result.orderInfo && (
                  <p className="mt-1 text-xs text-gray-500">
                    {result.orderInfo}
                  </p>
                )}
                {formatExpiresAt(result.expiresAt) && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-800">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Hết hạn gợi ý: {formatExpiresAt(result.expiresAt)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={openVnpay}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f57224] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#e0651a]"
              >
                <ExternalLink className="h-4 w-4" />
                Mở VNPay (tab mới)
              </button>

              <p className="text-center text-xs text-gray-500">
                Sau thanh toán, trạng thái cập nhật qua IPN — bạn có thể đóng
                cửa sổ và bấm làm mới trang đơn.
              </p>

              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPhase('options');
                    setResult(null);
                    setLocalError('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tạo lại
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Xong
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
