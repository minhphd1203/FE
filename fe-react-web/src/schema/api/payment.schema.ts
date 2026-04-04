import { z } from 'zod';

/** POST /buyer/v1/transactions */
/** POST /buyer/v1/transactions (apis/paymentApi) */
export const createTransactionRequestSchema = z.object({
  bikeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
  transactionType: z.string().optional(),
  paymentMethod: z.string().nullable().optional(),
  address: z.string().optional(),
  shippingAddress: z.string().optional(),
});

/** POST /buyer/v1/transactions (api/buyerApi — amount string | number) */
export const createTransactionRequestLooseSchema = z.object({
  bikeId: z.string().min(1),
  amount: z.union([z.coerce.number(), z.string().min(1)]),
});

export const createTransactionResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string(),
        status: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

/** POST /payment/v1/create/:transactionId */
export const createPaymentUrlResponseSchema = z
  .object({
    data: z
      .object({
        paymentUrl: z.string().min(1),
        transactionId: z.string(),
        amount: z.coerce.number(),
        orderInfo: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

/** GET /payment/v1/status/:transactionId */
export const paymentStatusResponseSchema = z
  .object({
    data: z
      .object({
        status: z.string(),
        paymentMethod: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

/** GET /payment/v1/vnpay-return?... */
export const vnpayReturnEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z
      .object({
        status: z.string().optional(),
        transactionId: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type CreateTransactionRequest = z.infer<
  typeof createTransactionRequestSchema
>;

/** Query sau redirect VNPay (đọc trên FE — `api/paymentApi.handleVNPayReturn`) */
export const vnpayReturnQueryParamsSchema = z.record(z.string(), z.unknown());
