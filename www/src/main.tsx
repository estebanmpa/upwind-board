import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './theme/global.css';
import 'dayjs/locale/es';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { ErrorState } from './components/common/ErrorState';
import { NotFound } from './components/common/NotFound';
import { routeTree } from './routeTree.gen';
import { theme } from './theme/theme';

dayjs.locale('es');

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <ModalsProvider labels={{ confirm: 'Confirmar', cancel: 'Cancelar' }}>
            <RouterProvider router={router} />
          </ModalsProvider>
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
);
