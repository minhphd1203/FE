import { configureStore } from '@reduxjs/toolkit';
import authReducer, { authInitialState } from './slices/authSlice';
import { readStoredAuth } from '../utils/authStorage';

function buildInitialAuthState() {
  const stored = readStoredAuth();
  if (stored) {
    return {
      ...authInitialState,
      user: stored.user,
      token: stored.token,
      isAuthenticated: true,
      isHydrated: true,
    };
  }
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return { ...authInitialState, isHydrated: true };
  }
  /* Còn token nhưng chưa có JSON user (phiên cũ) — AuthBootstrap gọi /auth/me */
  return { ...authInitialState, isHydrated: false };
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: buildInitialAuthState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
