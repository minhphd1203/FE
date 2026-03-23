/**
 * GET /inspector/v1/bikes/:id có thể trả nhiều dạng: phẳng, `{ data: bike }`,
 * `{ bike, seller }`, `{ listing, user }`, v.v. — gom về một view cho UI.
 */
export type InspectorBikeDetailView = {
  id: string;
  title: string;
  price: number | string | null;
  condition: string;
  description: string;
  sellerName: string;
  seller?: { name?: string; email?: string; phone?: string };
  images?: string[];
  brand?: string;
  model?: string;
  year?: number | null;
  mileage?: number | string | null;
  color?: string;
  video?: string | null;
  status?: string;
  inspectionStatus?: string;
  isVerified?: string;
  categoryId?: string | null;
  /** Tên danh mục nếu API trả nested `category` hoặc `categoryName`. */
  categoryName?: string;
  sellerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function unwrapDataOnce(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) return {};
  const d1 = payload.data;
  if (!isRecord(d1)) return payload;
  const merged: Record<string, unknown> = { ...payload, ...d1 };
  const d2 = d1.data;
  if (
    isRecord(d2) &&
    (d2.bike != null || d2.title != null || d2.listing != null)
  ) {
    Object.assign(merged, d2);
  }
  return merged;
}

function pickSellerName(obj: Record<string, unknown>): string {
  if (typeof obj.sellerName === 'string' && obj.sellerName.trim())
    return obj.sellerName.trim();
  if (typeof obj.seller === 'string' && obj.seller.trim())
    return obj.seller.trim();

  const blocks = [obj.seller, obj.user, obj.owner, obj.sellerUser];
  for (const b of blocks) {
    if (isRecord(b) && typeof b.name === 'string' && b.name.trim()) {
      return b.name.trim();
    }
  }
  return '';
}

function mergeBikeLayer(
  root: Record<string, unknown>,
): Record<string, unknown> {
  const bike = root.bike ?? root.listing ?? root.vehicle ?? root.post;
  if (isRecord(bike)) {
    return { ...bike, ...root };
  }
  const insp = root.inspection;
  if (isRecord(insp)) {
    const b = insp.bike;
    if (isRecord(b)) return { ...insp, ...b, ...root };
    return { ...insp, ...root };
  }
  return root;
}

function strOpt(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

function numOpt(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(String(v).replace(/\./g, ''));
  return Number.isFinite(n) ? n : null;
}

export function formatInspectorPrice(
  p: number | string | null | undefined,
): string {
  if (p == null || p === '') return '-';
  if (typeof p === 'number' && Number.isFinite(p)) {
    return p.toLocaleString('vi-VN') + ' đ';
  }
  const s = String(p).trim();
  const digits = s.replace(/\./g, '').replace(/[^\d]/g, '');
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n)) return n.toLocaleString('vi-VN') + ' đ';
  }
  return s + (s.includes('đ') ? '' : ' đ');
}

/**
 * @param payload — body sau khi axios (thường đã bỏ envelope ngoài một lớp)
 */
export function normalizeInspectorBikeDetail(
  payload: unknown,
): InspectorBikeDetailView | null {
  const root = unwrapDataOnce(payload);
  if (!isRecord(root) || Object.keys(root).length === 0) return null;

  const layer = mergeBikeLayer(root);

  const id = String(layer.id ?? root.id ?? root.bikeId ?? '');
  const title = String(
    layer.title ?? layer.listingTitle ?? root.title ?? 'Không có tiêu đề',
  );
  const price =
    layer.price ?? root.price ?? layer.askingPrice ?? root.askingPrice ?? null;
  const condition = String(
    layer.condition ?? root.condition ?? layer.state ?? '',
  );
  const description = String(
    layer.description ?? root.description ?? layer.details ?? '',
  );

  let sellerName = pickSellerName(layer) || pickSellerName(root);
  const sellerRaw = (layer.seller ?? root.seller) as unknown;
  const seller =
    isRecord(sellerRaw) && (sellerRaw.name || sellerRaw.email)
      ? {
          name: typeof sellerRaw.name === 'string' ? sellerRaw.name : undefined,
          email:
            typeof sellerRaw.email === 'string' ? sellerRaw.email : undefined,
          phone:
            typeof sellerRaw.phone === 'string' ? sellerRaw.phone : undefined,
        }
      : undefined;
  if (!sellerName && seller?.name) sellerName = seller.name;

  const imgs = layer.images ?? root.images;
  const images = Array.isArray(imgs)
    ? imgs.filter((x): x is string => typeof x === 'string')
    : undefined;

  const sellerIdRaw = layer.sellerId ?? root.sellerId;
  const sellerId =
    typeof sellerIdRaw === 'string' && sellerIdRaw.trim()
      ? sellerIdRaw.trim()
      : null;

  const catBlock = layer.category ?? root.category;
  let categoryName: string | undefined;
  let categoryIdRaw: unknown =
    layer.categoryId ??
    root.categoryId ??
    layer.category_id ??
    root.category_id ??
    layer.listingCategoryId ??
    root.listingCategoryId;

  if (isRecord(catBlock)) {
    if (categoryIdRaw == null || categoryIdRaw === '') {
      categoryIdRaw = catBlock.id ?? catBlock.categoryId;
    }
    const n = catBlock.name ?? catBlock.label ?? catBlock.title;
    if (typeof n === 'string' && n.trim()) categoryName = n.trim();
  } else if (typeof catBlock === 'string' && catBlock.trim()) {
    categoryName = catBlock.trim();
  }

  const nameFromLayer = strOpt(layer.categoryName ?? root.categoryName);
  if (nameFromLayer) categoryName = nameFromLayer;

  const categoryId =
    categoryIdRaw === null ||
    categoryIdRaw === undefined ||
    categoryIdRaw === ''
      ? null
      : String(categoryIdRaw);

  return {
    id,
    title,
    price: price as number | string | null,
    condition,
    description,
    sellerName,
    seller,
    images,
    brand: strOpt(layer.brand ?? root.brand),
    model: strOpt(layer.model ?? root.model),
    year: numOpt(layer.year ?? root.year),
    mileage: (() => {
      const m = layer.mileage ?? root.mileage;
      if (m == null || m === '') return null;
      return m as number | string;
    })(),
    color: strOpt(layer.color ?? root.color),
    video: (() => {
      const v = layer.video ?? root.video;
      if (v == null || v === '') return null;
      return String(v);
    })(),
    status: strOpt(layer.status ?? root.status),
    inspectionStatus: strOpt(layer.inspectionStatus ?? root.inspectionStatus),
    isVerified: strOpt(layer.isVerified ?? root.isVerified),
    categoryId,
    categoryName,
    sellerId,
    createdAt: strOpt(layer.createdAt ?? root.createdAt),
    updatedAt: strOpt(layer.updatedAt ?? root.updatedAt),
  };
}

/** Id xe để gọi POST start/inspect — ưu tiên bikeId từ item danh sách. */
export function inspectorDetailRouteId(item: Record<string, unknown>): string {
  const bikeId = item.bikeId;
  if (typeof bikeId === 'string' && bikeId) return bikeId;
  const bike = item.bike;
  if (isRecord(bike) && typeof bike.id === 'string' && bike.id) return bike.id;
  if (typeof item.id === 'string' && item.id) return item.id;
  return '';
}
