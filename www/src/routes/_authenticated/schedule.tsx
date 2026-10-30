import { createFileRoute } from '@tanstack/react-router';
import { SchedulePage } from '@/pages/lessons/SchedulePage';

export const Route = createFileRoute('/_authenticated/schedule')({
  component: SchedulePage,
});
