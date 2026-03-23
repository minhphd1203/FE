import { z } from 'zod';

/** GET /buyer/v1/bikes/search */
export const buyerSearchBikesQuerySchema = z
  .object({
    brand: z.string().optional(),
    model: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    condition: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  })
  .passthrough();

/** GET /buyer/v1/bikes/recommended?limit= */
export const buyerRecommendedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/** POST /buyer/v1/wishlist */
export const buyerWishlistAddBodySchema = z.object({
  bikeId: z.string().min(1),
});

/** GET (vd. transactions) — phân trang */
export const buyerPagedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

/** GET search — biến thể `api/buyerApi` (keyword) */
export const buyerSearchBikesLegacyQuerySchema = z
  .object({
    keyword: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    condition: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

/** POST /buyer/v1/reports */
export const buyerReportViolationBodySchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
});

/** POST /buyer/v1/reviews */
export const buyerReviewSellerBodySchema = z.object({
  sellerId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1),
});

/** POST /buyer/v1/messages/:sellerId */
export const buyerMessageSellerBodySchema = z.object({
  message: z.string().min(1),
});

/** Card/listing buyer (response lỏng) */
export const buyerBikeCardSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    price: z.coerce.number(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    image: z.string().optional(),
    createdAt: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();
