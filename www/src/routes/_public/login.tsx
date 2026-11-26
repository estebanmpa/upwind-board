import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginPage } from '@/pages/auth/LoginPage';

export const Route = createFileRoute('/_public/login')({
  // Signed-in users go straight to the app.
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) throw redirect({ to: '/' });
  },
  component: LoginPage,
});
