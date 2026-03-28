import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from '@tanstack/react-query';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const errObj = error as any;
    const msg = errObj?.response?.data?.message;
    if (msg) return msg;
  }
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra, vui lòng thử lại sau.';
};

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      // Bỏ qua nếu mutation options có cờ tắt toast
      if (mutation.meta?.hideToast) return;
      toast.success('Thao tác thành công!');
    },
    onError: (error, variables, context, mutation) => {
      if (mutation.meta?.hideToast) return;
      toast.error(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
