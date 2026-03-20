import type { SyntheticEvent } from 'react';

const FALLBACK_BIKE_IMAGES = [
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1200&h=900&fit=crop',
];

const SUSPICIOUS_PATTERN =
  /(porn|sex|nude|xxx|adult|erotic|hentai|18\+|image-you-are-requesting)/i;
const BIKE_HINT_PATTERN =
  /(bike|bicycle|cycle|cycling|xe-dap|xedap|giant|trek|specialized|cannondale|pinarello|brompton)/i;

const hashString = (text: string) => {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const getBikeImage = (rawUrl?: string, seed = '') => {
  // Chỉ chấp nhận URL có "hint" liên quan xe đạp.
  // URL lạ sẽ fallback để tránh hiện ảnh không phù hợp.
  const hasValidBikeHint = rawUrl ? BIKE_HINT_PATTERN.test(rawUrl) : false;
  if (!rawUrl || SUSPICIOUS_PATTERN.test(rawUrl) || !hasValidBikeHint) {
    const idx = hashString(seed || 'bike') % FALLBACK_BIKE_IMAGES.length;
    return FALLBACK_BIKE_IMAGES[idx];
  }
  return rawUrl;
};

export const handleBikeImageError = (
  event: SyntheticEvent<HTMLImageElement>,
  seed = '',
) => {
  const idx = hashString(seed || 'bike-error') % FALLBACK_BIKE_IMAGES.length;
  event.currentTarget.src = FALLBACK_BIKE_IMAGES[idx];
};
