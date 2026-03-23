import React from 'react';
import { Navigate } from 'react-router-dom';

/** Gộp với trang yêu thích (cùng API wishlist). */
export const SavedListingsPage: React.FC = () => (
  <Navigate to="/yeu-thich" replace />
);
