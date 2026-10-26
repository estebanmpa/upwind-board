import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * Access-control layout for the instructors' app. Auth is not implemented
 * yet, so every visitor is let through; the session check will live in
 * `beforeLoad`.
 */
export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
