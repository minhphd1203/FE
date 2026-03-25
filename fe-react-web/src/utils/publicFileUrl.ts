/** Nối path file tương đối (uploads/...) với origin API (bỏ hậu tố /api). */
export function resolvePublicFileUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin =
    (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(
      /\/api\/?$/,
      '',
    ) || 'http://localhost:3000';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${p}`;
}
