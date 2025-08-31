import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient();
export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);
