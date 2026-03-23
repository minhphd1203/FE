import { z } from 'zod';

/** GET inspector search — dùng chung buyer search params */
export const inspectorSearchBikesQuerySchema = z
  .object({
    brand: z.string().optional(),
    model: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    condition: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  })
  .passthrough();

/**
 * POST /inspector/v1/bikes/:id/inspect
 * BE có thể khác field — dùng passthrough sau khi validate tối thiểu.
 */
export const inspectorSubmitInspectionSchema = z
  .object({
    result: z.enum(['passed', 'failed', 'pending']).optional(),
    notes: z.string().optional(),
    checklist: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/** PUT /inspector/v1/inspections/:id — payload tùy BE */
export const inspectorUpdateInspectionBodySchema = z.record(
  z.string(),
  z.unknown(),
);
