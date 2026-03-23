import { z } from 'zod';
import { apiEnvelopeSchema, listMetaSchema } from './common.schema';

// --- GET /seller/v1/dashboard ---
export const sellerDashboardBikesStatsSchema = z
  .object({
    total: z.coerce.number(),
    pending: z.coerce.number(),
    approved: z.coerce.number(),
    rejected: z.coerce.number(),
    hidden: z.coerce.number(),
    sold: z.coerce.number(),
  })
  .passthrough();

export const sellerDashboardTransactionsStatsSchema = z
  .object({
    total: z.coerce.number(),
    pending: z.coerce.number(),
    approved: z.coerce.number(),
    completed: z.coerce.number(),
    cancelled: z.coerce.number(),
    totalRevenue: z.coerce.number(),
  })
  .passthrough();

export const sellerDashboardReputationSchema = z
  .object({
    totalReviews: z.coerce.number(),
    averageRating: z.coerce.number(),
  })
  .passthrough();

export const sellerDashboardDataSchema = z.object({
  bikes: sellerDashboardBikesStatsSchema,
  transactions: sellerDashboardTransactionsStatsSchema,
  reputation: sellerDashboardReputationSchema,
});

export const sellerDashboardResponseSchema = apiEnvelopeSchema(
  sellerDashboardDataSchema,
);

// --- Danh mục đăng tin ---
export const listingCategoryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
});

// --- Form đăng tin (trước khi build FormData) — đồng bộ PostListingPage ---
export const postListingFormSchema = z.object({
  categoryId: z.string().min(1, 'Chọn loại xe đạp'),
  title: z.string().min(1, 'Nhập tiêu đề'),
  brand: z.string().min(1, 'Nhập hãng'),
  model: z.string().min(1, 'Nhập model'),
  year: z.string().min(1, 'Nhập năm'),
  priceRaw: z.string().min(1, 'Nhập giá'),
  condition: z.string().min(1),
  mileage: z.string().optional(),
  color: z.string().optional(),
  video: z.string().optional(),
  description: z.string().min(1, 'Nhập mô tả'),
  imageCount: z.number().int().min(1, 'Cần ít nhất một ảnh').max(5),
});

// --- POST response bike ---
export const sellerPostedBikeSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.coerce.number(),
    price: z.coerce.number(),
    condition: z.string(),
    images: z.array(z.string()),
    status: z.string(),
    categoryId: z.string(),
    sellerId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const postBikeApiResponseSchema = apiEnvelopeSchema(
  sellerPostedBikeSchema,
);

// --- GET /seller/v1/bikes ---
export const sellerBikesListQuerySchema = z
  .object({
    status: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  })
  .passthrough();

export const sellerBikeListCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })
  .passthrough();

export const sellerBikeListItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.coerce.number(),
    price: z.coerce.number(),
    condition: z.string(),
    color: z.string(),
    images: z.array(z.string()),
    video: z.string().nullable().optional(),
    status: z.string(),
    isVerified: z.string(),
    inspectionStatus: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    category: sellerBikeListCategorySchema,
  })
  .passthrough();

export const sellerBikesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.array(sellerBikeListItemSchema),
    message: z.string().optional(),
    meta: listMetaSchema,
  })
  .passthrough();

// --- Offers / transactions / messages ---
export const sellerOfferRespondBodySchema = z.object({
  action: z.enum(['accept', 'reject']),
  counterOffer: z.coerce.number().optional(),
});

export const sellerTransactionUpdateBodySchema = z.object({
  status: z.union([z.enum(['completed', 'cancelled']), z.string()]),
  notes: z.string().optional(),
});

export const sellerSendMessageBodySchema = z.object({
  content: z.string().min(1),
  bikeId: z.string().min(1),
});

export const sellerPartnerMessagesQuerySchema = z
  .object({
    bikeId: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();
