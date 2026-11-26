import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';

/** Instructors' app: requires an IAM session granting access to Upwind Board. */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const { isAuthenticated, verifySession } = context.auth;
    const session = isAuthenticated ? await verifySession() : null;
    if (!session) throw redirect({ to: '/login' });
    if (!session.hasAccess) throw redirect({ to: '/no-access' });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
