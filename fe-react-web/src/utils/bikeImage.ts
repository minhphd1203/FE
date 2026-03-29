import type { SyntheticEvent } from 'react';

export const getBikeImage = (rawUrl?: string, seed = '') => {
  if (!rawUrl) {
    // Return empty string instead of fake Unsplash image
    return '';
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const origin = apiBase.replace(/\/?api\/?$/i, '');

  if (/^https?:\/\//i.test(rawUrl)) {
    // If it's a local uploads URL with wrong domain (old data), fix it
    if (/^https?:\/\/localhost:4200\/uploads\//i.test(rawUrl)) {
      return rawUrl.replace(/^https?:\/\/localhost:4200/i, origin);
    }
    // Otherwise return as-is
    return rawUrl;
  }

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
