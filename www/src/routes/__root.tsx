import type { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { ErrorState } from '@/components/common/ErrorState';
import { NotFound } from '@/components/common/NotFound';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: ErrorState,
  notFoundComponent: NotFound,
});
