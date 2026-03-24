/** Central React Query keys — grouped by actor (admin, buyer, inspector, seller). */

type SellerPartnerMessagesKeyParams = {
  bikeId?: string;
  page?: number;
  limit?: number;
};

export const queryKeys = {
  admin: {
    bikes: () => ['admin', 'bikes'] as const,
    users: () => ['admin', 'users'] as const,
    reports: (status: string) => ['admin', 'reports', status] as const,
    transactions: (status: string) =>
      ['admin', 'transactions', status] as const,
    categories: () => ['admin', 'categories'] as const,
  },
  buyer: {
    recommended: (limit: number) => ['buyer', 'recommended', limit] as const,
    search: (params: Record<string, unknown>) =>
      ['buyer', 'search', params] as const,
    bike: (id: string) => ['buyer', 'bike', id] as const,
    wishlist: (p: { page?: number; limit?: number }) =>
      ['buyer', 'wishlist', p.page ?? 1, p.limit ?? 10] as const,
    transactions: (p: { status?: string; page?: number; limit?: number }) =>
      [
        'buyer',
        'transactions',
        p.status ?? '',
        p.page ?? 1,
        p.limit ?? 10,
      ] as const,
    transaction: (id: string) => ['buyer', 'transaction', id] as const,
    conversations: () => ['buyer', 'conversations'] as const,
    messages: (
      sellerId: string,
      p?: { bikeId?: string; page?: number; limit?: number },
    ) =>
      [
        'buyer',
        'messages',
        sellerId,
        p?.bikeId ?? '',
        p?.page ?? 1,
        p?.limit ?? 30,
      ] as const,
    paymentVerify: (search: string) =>
      ['buyer', 'payment-verify', search] as const,
  },
  inspector: {
    pendingBikes: () => ['inspector', 'pending-bikes'] as const,
    bike: (id: string) => ['inspector', 'bike', id] as const,
    history: () => ['inspector', 'history'] as const,
    historyDetail: (id: string) => ['inspector', 'history-detail', id] as const,
    dashboard: () => ['inspector', 'dashboard'] as const,
    searchBikes: (params: Record<string, unknown>) =>
      ['inspector', 'search-bikes', params] as const,
  },
  seller: {
    /** GET /seller/v1/bikes — tuple để key ổn định giữa các lần render */
    myBikes: (p: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    }) =>
      [
        'seller',
        'bikes',
        'list',
        p.page ?? 1,
        p.limit ?? 10,
        p.sortBy ?? 'createdAt',
        p.sortOrder ?? 'desc',
        p.status ?? '',
        p.search ?? '',
      ] as const,
    bike: (id: string) => ['seller', 'bike', id] as const,
    offers: (page: number, limit: number) =>
      ['seller', 'offers', page, limit] as const,
    /** GET /seller/v1/transactions */
    transactionsList: (p: { page?: number; limit?: number; status?: string }) =>
      [
        'seller',
        'transactions',
        'list',
        p.page ?? 1,
        p.limit ?? 10,
        p.status ?? '',
      ] as const,
    transaction: (id: string) => ['seller', 'transaction', id] as const,
    /** GET /seller/v1/messages */
    messageThreads: () => ['seller', 'messages', 'threads'] as const,
    /** GET /seller/v1/messages/:partnerId */
    partnerMessages: (partnerId: string, p: SellerPartnerMessagesKeyParams) =>
      [
        'seller',
        'messages',
        'partner',
        partnerId,
        p.bikeId ?? '',
        p.page ?? 1,
        p.limit ?? 30,
      ] as const,
    /** GET /seller/v1/reviews */
    reviews: (page: number, limit: number) =>
      ['seller', 'reviews', page, limit] as const,
    dashboard: () => ['seller', 'dashboard'] as const,
    salesStats: () => ['seller', 'sales-stats'] as const,
  },
} as const;
