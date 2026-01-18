import { useQuery } from '@tanstack/react-query';

interface UseQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

export function useCustomQuery<T>(options: UseQueryOptions<T>) {
  return useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: options.enabled,
  });
}
