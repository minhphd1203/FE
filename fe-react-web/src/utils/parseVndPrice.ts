/**
 * Parse ô nhập giá VNĐ: chấm/cách phân hàng nghìn, ký tự đ, khoảng trắng.
 * Ví dụ: "45.000.000", "45 000 000", "45000000" → 45000000
 */
export function parseVndPriceInput(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '').replace(/đ/gi, '').replace(/\./g, '');
  if (s === '' || !/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
