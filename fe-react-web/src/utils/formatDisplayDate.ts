import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * ISO / chuỗi ngày → giờ địa phương, dễ đọc.
 * Ví dụ: "07:54, 23/03/2026" hoặc bản địa hoá ngắn với locale `vi`.
 */
export function formatDateTimeVi(isoOrDate: string | undefined | null): string {
  if (isoOrDate == null || String(isoOrDate).trim() === '') return '—';
  const s = String(isoOrDate).trim();
  try {
    const d = parseISO(s);
    if (!isValid(d)) return s;
    return format(d, 'PPp', { locale: vi });
  } catch {
    return s;
  }
}
