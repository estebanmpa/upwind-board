import { createFileRoute } from '@tanstack/react-router';
import { NoAccessPage } from '@/pages/auth/NoAccessPage';

export const Route = createFileRoute('/_public/no-access')({
  component: NoAccessPage,
});
