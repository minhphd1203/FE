import { useQuery } from '@tanstack/react-query';
import { getBrands, getModelsByBrand } from '../apis/brandModelApi';

export function useBrandsQuery() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 5 * 60 * 1000,
  });
}

export function useModelsByBrandQuery(brandId: string) {
  return useQuery({
    queryKey: ['models', brandId],
    queryFn: () => getModelsByBrand(brandId),
    enabled: Boolean(brandId),
    staleTime: 5 * 60 * 1000,
  });
}
