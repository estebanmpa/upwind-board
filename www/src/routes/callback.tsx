import { useCallback } from 'react';
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { CallbackPage } from '@/iam';

// Outside the public layout: the whole login round-trip is one full-screen loader.
export const Route = createFileRoute('/callback')({
  validateSearch: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  }),
  component: CallbackRoute,
});

function CallbackRoute() {
  const router = useRouter();
  const navigate = useNavigate();
  // Loading the dashboard before leaving keeps this loader on screen.
  const goToApp = useCallback(async () => {
    await router.preloadRoute({ to: '/' }).catch(() => undefined);
    await navigate({ to: '/', replace: true });
  }, [router, navigate]);
  const goToLogin = useCallback(
    () => navigate({ to: '/login', replace: true }),
    [navigate],
  );

  return (
    <CallbackPage
      search={Route.useSearch()}
      onAuthenticated={goToApp}
      onBackToLogin={goToLogin}
    />
  );
}
