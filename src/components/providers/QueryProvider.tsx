"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
  /** Children elements that will be wrapped by the Query client provider */
  children: React.ReactNode;
};

/**
 * Shared QueryClient instance for the application.
 */
const queryClient = new QueryClient();

/**
 * Wraps application parts with `QueryClientProvider` from `@tanstack/react-query`.
 * @returns The provider rendering `children` with react-query client
 */
function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
