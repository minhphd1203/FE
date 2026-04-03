import apiClient from './apiClient';

/** GET /api/seller/v1/dashboard — payload trong `data` */
export interface SellerDashboardBikesStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  sold: number;
}

export interface SellerDashboardTransactionsStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface SellerDashboardReputation {
  totalReviews: number;
  averageRating: number;
}

export interface SellerDashboardData {
  bikes: SellerDashboardBikesStats;
  transactions: SellerDashboardTransactionsStats;
  reputation: SellerDashboardReputation;
}

interface SellerDashboardApiResponse {
  success: boolean;
  data: SellerDashboardData;
  message?: string;
}

function parseSellerDashboardPayload(payload: unknown): SellerDashboardData {
  if (
    payload &&
    typeof payload === 'object' &&
    'bikes' in payload &&
    'transactions' in payload &&
    'reputation' in payload
  ) {
    return payload as SellerDashboardData;
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (
      inner &&
      typeof inner === 'object' &&
      'bikes' in inner &&
      'transactions' in inner &&
      'reputation' in inner
    ) {
      return inner as SellerDashboardData;
    }
  }
  throw new Error('Invalid seller dashboard response');
}

/** Trích id xe từ nhiều dạng response BE thường dùng */
export function extractBikeIdFromPostResponse(
  payload: unknown,
): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const o = payload as Record<string, unknown>;
  if (typeof o.id === 'string') return o.id;
  const data = o.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.id === 'string') return d.id;
    if (typeof d.bikeId === 'string') return d.bikeId;
  }
  return undefined;
}

/** POST /api/seller/v1/bikes — 201, multipart/form-data */
export interface SellerPostedBike {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  mileage?: number;
  color?: string;
  images: string[];
  video?: string | null;
  status: string;
  isVerified?: string;
  inspectionStatus?: string;
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostBikeApiResponse {
  success: boolean;
  data: SellerPostedBike;
  message?: string;
}

/**
 * Trường text/video/category — khớp Swagger POST/PUT `/api/seller/v1/bikes`.
 * Bắt buộc: title, description, brand, model, year, price, condition (gửi dạng string trong multipart).
 * Tuỳ chọn: mileage, color, categoryId (UUID), video (URL, không upload file).
 */
export type BikeListingCoreMultipartFields = {
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  condition: string;
  /** UUID danh mục — lấy từ GET /api/seller/v1/categories; bỏ qua nếu không gửi */
  categoryId?: string;
  mileage?: string;
  color?: string;
  video?: string;
};

function appendBikeListingCoreToFormData(
  fd: FormData,
  fields: BikeListingCoreMultipartFields,
): void {
  fd.append('title', fields.title);
  fd.append('description', fields.description);
  fd.append('brand', fields.brand);
  fd.append('model', fields.model);
  fd.append('year', String(fields.year));
  fd.append('price', String(fields.price));
  fd.append('condition', fields.condition);
  const cat = fields.categoryId?.trim();
  if (cat) {
    fd.append('categoryId', cat);
  }
  if (fields.mileage != null && fields.mileage !== '') {
    fd.append('mileage', fields.mileage);
  }
  if (fields.color != null && fields.color !== '') {
    fd.append('color', fields.color);
  }
  if (fields.video != null && fields.video.trim() !== '') {
    fd.append('video', fields.video.trim());
  }
}

/** Các trường text + file ảnh (BE: nhiều part cùng tên `images`) */
export type PostBikeMultipartFields = BikeListingCoreMultipartFields & {
  imageFiles: File[];
};

export function buildPostBikeFormData(
  fields: PostBikeMultipartFields,
): FormData {
  const fd = new FormData();
  appendBikeListingCoreToFormData(fd, fields);
  for (const file of fields.imageFiles) {
    fd.append('images', file);
  }
  return fd;
}

/** PUT /seller/v1/bikes/{id} — multipart; ảnh mới tuỳ chọn (không gửi file = giữ ảnh cũ) */
export type UpdateBikeMultipartFields = BikeListingCoreMultipartFields & {
  imageFiles?: File[];
};

export function buildUpdateBikeFormData(
  fields: UpdateBikeMultipartFields,
): FormData {
  const fd = new FormData();
  appendBikeListingCoreToFormData(fd, fields);
  if (fields.imageFiles?.length) {
    for (const file of fields.imageFiles) {
      fd.append('images', file);
    }
  }
  return fd;
}

/**
 * Đăng tin bán xe — POST `/api/seller/v1/bikes` (multipart/form-data).
 * Ảnh: nhiều part cùng tên `images` (jpeg, png, webp, gif).
 * Không set Content-Type thủ công — axios gắn boundary.
 */
export async function postBike(
  formData: FormData,
): Promise<PostBikeApiResponse> {
  const res = await apiClient.post<PostBikeApiResponse>(
    '/seller/v1/bikes',
    formData,
    { timeout: 120_000 },
  );
  return res.data;
}

/** Danh mục cho form đăng tin (UUID từ BE). Thử vài path phổ biến. */
export type ListingCategoryOption = { id: string; name: string; slug?: string };

function extractCategoryListFromPayload(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  const inner = root.data;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>;
    for (const key of ['categories', 'items', 'rows', 'records']) {
      const arr = o[key];
      if (Array.isArray(arr)) return arr;
    }
  }
  return null;
}

/** Định dạng UUID chuẩi (8-4-4-4-12), không ép variant/version — khớp hầu hết BE. */
export function isCategoryUuid(value: string): boolean {
  const s = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export async function getSellerListingCategories(): Promise<
  ListingCategoryOption[] | null
> {
  /** Swagger: GET `/api/seller/v1/categories` (baseURL thường đã có `/api`). */
  const paths = [
    '/seller/v1/categories',
    '/seller/v1/category',
    '/buyer/v1/categories',
    '/buyer/v1/category',
    '/buyer/v1/bikes/categories',
    '/category',
  ];
  for (const path of paths) {
    try {
      const res = await apiClient.get<unknown>(path);
      const list = extractCategoryListFromPayload(res.data);
      if (!list || list.length === 0) continue;
      const first = list[0];
      if (!first || typeof first !== 'object') continue;
      const row = first as Record<string, unknown>;
      if (row.id === undefined || row.id === null) continue;
      const idStr = String(row.id).trim();
      if (!idStr) continue;
      const mapped = list
        .map((item) => {
          const r = item as Record<string, unknown>;
          const rid = r.id == null ? '' : String(r.id).trim();
          if (!rid) return null;
          const opt: ListingCategoryOption = {
            id: rid,
            name: String(r.name ?? r.title ?? 'Danh mục'),
          };
          if (typeof r.slug === 'string') opt.slug = r.slug;
          return opt;
        })
        .filter((x): x is ListingCategoryOption => x != null);
      if (mapped.length === 0) continue;
      return mapped;
    } catch {
      continue;
    }
  }
  return null;
}

/** GET /api/seller/v1/bikes — danh sách tin đăng của seller */
export interface SellerBikeListCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SellerBikeListItem {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  color: string;
  images: string[];
  video: string | null;
  status: string;
  isVerified: string;
  inspectionStatus: string;
  createdAt: string;
  updatedAt: string;
  category: SellerBikeListCategory;
}

export interface SellerBikesListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SellerBikesListResponse {
  success: boolean;
  data: SellerBikeListItem[];
  message?: string;
  meta: SellerBikesListMeta;
}

export type SellerBikesListParams = {
  /** Lọc theo trạng thái (vd: pending, approved, …) */
  status?: string;
  /** Tìm theo title, brand, model */
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
  page?: number;
  limit?: number;
};

function buildSellerBikesQueryParams(
  params: SellerBikesListParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  out.page = page;
  out.limit = limit;
  if (params.sortBy != null && params.sortBy !== '') {
    out.sortBy = params.sortBy;
  }
  if (params.sortOrder != null && params.sortOrder !== '') {
    out.sortOrder = params.sortOrder;
  }
  if (params.status != null && params.status !== '') {
    out.status = params.status;
  }
  if (params.search != null && params.search.trim() !== '') {
    out.search = params.search.trim();
  }
  return out;
}

export async function getSellerBikesList(
  params: SellerBikesListParams = {},
): Promise<SellerBikesListResponse> {
  const res = await apiClient.get<SellerBikesListResponse>('/seller/v1/bikes', {
    params: buildSellerBikesQueryParams(params),
  });
  return res.data;
}

/** Ảnh trả về có thể là path tương đối — ghép origin từ VITE_API_URL */
export function resolveBikeMediaUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const origin = apiBase.replace(/\/?api\/?$/i, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** GET /api/seller/v1/bikes/{id} — chi tiết tin (inspections, transactions) */
export interface SellerBikeDetailCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

/** Inspection result from inspector */
export interface SellerBikeDetailInspection {
  id?: string;
  createdAt: string;
  status: string;
  overallCondition: string;
  frameCondition: string;
  wheelCondition: string;
  brakeCondition: string;
  drivetrainCondition: string;
  inspectionNote?: string | null;
  recommendation?: string | null;
  inspectionImages?: string[];
  [key: string]: unknown;
}

/** Transaction (offer) from buyer */
export interface SellerBikeDetailTransaction {
  id?: string;
  createdAt: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  notes?: string | null;
  buyer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  [key: string]: unknown;
}

export interface SellerBikeDetail {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  mileage?: number | null;
  color: string;
  images: string[];
  video: string | null;
  status: string;
  isVerified: string;
  inspectionStatus: string;
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  category: SellerBikeDetailCategory;
  inspections: SellerBikeDetailInspection[];
  transactions: SellerBikeDetailTransaction[];
}

export interface SellerBikeDetailApiResponse {
  success: boolean;
  data: SellerBikeDetail;
  message?: string;
}

export async function getBikeDetail(
  bikeId: string,
): Promise<SellerBikeDetailApiResponse> {
  const res = await apiClient.get<SellerBikeDetailApiResponse>(
    `/seller/v1/bikes/${bikeId}`,
  );
  return res.data;
}

/** Response PUT sửa tin — thường cùng envelope với GET chi tiết */
export type UpdateBikeApiResponse = SellerBikeDetailApiResponse;

/**
 * Sửa tin đăng — multipart/form-data (Swagger: JSON hoặc multipart; ảnh file, video URL).
 * Gửi FormData từ buildUpdateBikeFormData; axios tự gắn boundary.
 */
export async function updateBike(
  bikeId: string,
  formData: FormData,
): Promise<UpdateBikeApiResponse> {
  const res = await apiClient.put<UpdateBikeApiResponse>(
    `/seller/v1/bikes/${bikeId}`,
    formData,
    { timeout: 120_000 },
  );
  return res.data;
}

/**
 * DELETE /api/seller/v1/bikes/{id}
 * 200: `{ success: true, message: "Tin đăng đã được xóa thành công" }` (không có `data`).
 * 400: không xóa được (GD pending / đã bán) — 401 / 404 theo Swagger.
 */
export interface DeleteSellerBikeApiResponse {
  success: boolean;
  message?: string;
}

export async function deleteBike(
  bikeId: string,
): Promise<DeleteSellerBikeApiResponse> {
  const res = await apiClient.delete<DeleteSellerBikeApiResponse>(
    `/seller/v1/bikes/${bikeId}`,
  );
  return res.data;
}

/**
 * PUT /api/seller/v1/bikes/{id}/visibility — ẩn / hiện tin (chỉ tin approved hoặc hidden).
 * Không body; response envelope giống GET chi tiết.
 */
export type SellerBikeVisibilityApiResponse = SellerBikeDetailApiResponse;

export async function toggleSellerBikeVisibility(
  bikeId: string,
): Promise<SellerBikeVisibilityApiResponse> {
  const res = await apiClient.put<SellerBikeVisibilityApiResponse>(
    `/seller/v1/bikes/${bikeId}/visibility`,
  );
  return res.data;
}

/**
 * POST /api/seller/v1/bikes/{id}/resubmit — gửi lại kiểm định (chỉ khi xe bị rejected).
 * Không body. 400 nếu chưa rejected / chưa đủ điều kiện.
 */
export type SellerBikeResubmitApiResponse = SellerBikeDetailApiResponse;

export async function resubmitSellerBike(
  bikeId: string,
): Promise<SellerBikeResubmitApiResponse> {
  const res = await apiClient.post<SellerBikeResubmitApiResponse>(
    `/seller/v1/bikes/${bikeId}/resubmit`,
  );
  return res.data;
}

export const getMyOffers = async (page: number = 1, limit: number = 10) => {
  // Map offers to pending transactions (since BE doesn't have a separate offers table)
  const res = await apiClient.get(
    `/seller/v1/transactions?status=pending&page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const respondToOffer = async (
  offerId: string,
  action: 'accept' | 'reject',
  counterOffer?: number,
) => {
  const status = action === 'accept' ? 'approved' : 'cancelled';
  let notes =
    action === 'accept'
      ? 'Người bán đã duyệt đề nghị mua'
      : 'Người bán đã từ chối để nghị mua';
  if (counterOffer && counterOffer > 0) {
    notes += ` (Có đề xuất giá mới: ${counterOffer} đ)`;
  }
  const res = await apiClient.put(`/seller/v1/transactions/${offerId}`, {
    status,
    notes,
  });
  return res.data;
};

// --- GET /seller/v1/transactions — đơn từ buyer ---

export type SellerTransactionsListParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export interface SellerTransactionsListResponse {
  success: boolean;
  data: unknown[];
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export async function getSellerTransactionsList(
  params: SellerTransactionsListParams = {},
): Promise<SellerTransactionsListResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const query: Record<string, string | number> = { page, limit };
  if (params.status != null && params.status !== '') {
    query.status = params.status;
  }
  const res = await apiClient.get<SellerTransactionsListResponse>(
    '/seller/v1/transactions',
    { params: query },
  );
  return res.data;
}

export interface SellerTransactionDetailResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

export async function getSellerTransactionDetail(
  transactionId: string,
): Promise<SellerTransactionDetailResponse> {
  const res = await apiClient.get<SellerTransactionDetailResponse>(
    `/seller/v1/transactions/${transactionId}`,
  );
  return res.data;
}

/** PUT /seller/v1/transactions/{id} — completed | cancelled + notes */
export type SellerTransactionUpdateBody = {
  status: 'completed' | 'cancelled' | string;
  notes?: string;
};

export interface SellerTransactionUpdateResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export async function updateSellerTransaction(
  transactionId: string,
  body: SellerTransactionUpdateBody,
): Promise<SellerTransactionUpdateResponse> {
  const res = await apiClient.put<SellerTransactionUpdateResponse>(
    `/seller/v1/transactions/${transactionId}`,
    body,
  );
  return res.data;
}

// --- /seller/v1/messages ---

export interface SellerConversationsResponse {
  success: boolean;
  data: unknown[];
  message?: string;
}

export async function getSellerConversations(): Promise<SellerConversationsResponse> {
  const res = await apiClient.get<SellerConversationsResponse>(
    '/seller/v1/messages',
  );
  return res.data;
}

export type SellerPartnerMessagesParams = {
  bikeId?: string;
  page?: number;
  limit?: number;
};

export interface SellerPartnerMessagesResponse {
  success: boolean;
  data: unknown[];
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export async function getSellerPartnerMessages(
  partnerId: string,
  params: SellerPartnerMessagesParams = {},
): Promise<SellerPartnerMessagesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 30;
  const query: Record<string, string | number> = { page, limit };
  if (params.bikeId != null && params.bikeId !== '') {
    query.bikeId = params.bikeId;
  }
  const res = await apiClient.get<SellerPartnerMessagesResponse>(
    `/seller/v1/messages/${partnerId}`,
    { params: query },
  );
  return res.data;
}

export type SellerSendMessageBody = {
  content: string;
  bikeId: string;
};

export interface SellerSendMessageResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export async function sendSellerMessage(
  partnerId: string,
  body: SellerSendMessageBody | FormData,
): Promise<SellerSendMessageResponse> {
  const res = await apiClient.post<SellerSendMessageResponse>(
    `/seller/v1/messages/${partnerId}`,
    body,
  );
  return res.data;
}

// --- GET /seller/v1/reviews ---

export interface SellerReviewsResponse {
  success: boolean;
  /** Danh sách + điểm TB — cấu trúc tùy BE */
  data: unknown;
  message?: string;
  meta?: unknown;
}

export async function getSellerReviews(
  page = 1,
  limit = 10,
): Promise<SellerReviewsResponse> {
  const res = await apiClient.get<SellerReviewsResponse>('/seller/v1/reviews', {
    params: { page, limit },
  });
  return res.data;
}

export const getMyDashboard = async (): Promise<SellerDashboardData> => {
  const res = await apiClient.get<
    SellerDashboardApiResponse | SellerDashboardData
  >('/seller/v1/dashboard');
  return parseSellerDashboardPayload(res.data);
};

export const getSalesStats = async () => {
  const res = await apiClient.get('/seller/v1/stats/sales');
  return res.data;
};
