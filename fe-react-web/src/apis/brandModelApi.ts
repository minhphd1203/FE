import apiClient from './apiClient';

export interface Brand {
  id: string;
  name: string;
  description?: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  description?: string;
}

/** GET /api/seller/v1/brands */
export async function getBrands() {
  const res = await apiClient.get<{ success: boolean; data: Brand[] }>(
    '/seller/v1/brands',
  );
  return res.data;
}

/** GET /api/seller/v1/brands/:brandId/models */
export async function getModelsByBrand(brandId: string) {
  const res = await apiClient.get<{ success: boolean; data: Model[] }>(
    `/seller/v1/brands/${brandId}/models`,
  );
  return res.data;
}
