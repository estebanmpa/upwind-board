import { createFileRoute } from '@tanstack/react-router';
import { InstructorsPage } from '@/pages/instructors/InstructorsPage';

export const Route = createFileRoute('/_authenticated/instructors/')({
  component: InstructorsPage,
});
