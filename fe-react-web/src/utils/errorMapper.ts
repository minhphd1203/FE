/**
 * Utility to handle and map query/API errors to user-friendly messages
 */
export const handleQueryError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || 'Lỗi không xác định';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Lỗi không xác định';
};
