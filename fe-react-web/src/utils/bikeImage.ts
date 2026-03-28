import type { SyntheticEvent } from 'react';

export const getBikeImage = (rawUrl?: string, seed = '') => {
  if (!rawUrl) {
    // Return empty string instead of fake Unsplash image
    return '';
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const origin = apiBase.replace(/\/?api\/?$/i, '');
  return `${origin}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
};

export const handleBikeImageError = (
  event: SyntheticEvent<HTMLImageElement>,
  seed = '',
) => {
  // Clear the src or set to a tiny transparent pixel to avoid broken image icon
  // without misleading the user with fake images.
  event.currentTarget.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
};
