import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './theme/global.css';

import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ErrorState } from './components/common/ErrorState';
import { NotFound } from './components/common/NotFound';
import { isUnauthorizedError } from './api/http';
import { AuthProvider, useAuth } from './iam';
import { routeTree } from './routeTree.gen';
import { theme } from './theme/theme';

// A 401 will not succeed on retry: the session is gone and is handled centrally.
const retryOnce = (failureCount: number, error: unknown) =>
  !isUnauthorizedError(error) && failureCount < 1;

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: retryOnce } },
});

const router = createRouter({
  routeTree,
  // `auth` is provided by RouterProviderWithAuth below.
  context: { queryClient, auth: undefined! },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  // Loaders throw notFound() for unknown ids; render it inside the app layout.
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorState,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function RouterProviderWithAuth() {
  const auth = useAuth();

  // Routes re-run their access checks when the user signs in or out.
  useEffect(() => {
    void router.invalidate();
  }, [auth.isAuthenticated]);

  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 1 }}>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <ModalsProvider labels={{ confirm: 'Confirm', cancel: 'Cancel' }}>
            <AuthProvider>
              <RouterProviderWithAuth />
            </AuthProvider>
          </ModalsProvider>
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
);
