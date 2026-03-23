import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AuthBootstrap } from './AuthBootstrap';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
};
