/** Nối path file tương đối (uploads/...) với origin API (bỏ hậu tố /api). */
export function resolvePublicFileUrl(path: string): string {
  if (!path) return '';

  // Get the actual API origin (should be backend)
  const origin =
    (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(
      /\/api\/?$/,
      '',
    ) || 'http://localhost:3000';

  // If it's already a full URL
  if (/^https?:\/\//i.test(path)) {
    // Check if it's a local uploads URL with wrong domain (old data)
    // e.g., http://localhost:4200/uploads/... should be redirected to localhost:3000
    if (/^https?:\/\/localhost:4200\/uploads\//i.test(path)) {
      // Replace wrong domain with correct one
      return path.replace(/^https?:\/\/localhost:4200/i, origin);
    }
    // Otherwise return as-is (external URLs)
    return path;
  }

  // If it's a relative path, prepend origin
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${p}`;
}
