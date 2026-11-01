import { createFileRoute } from '@tanstack/react-router';
import { InstructorCreatePage } from '@/pages/instructors/InstructorCreatePage';

export const Route = createFileRoute('/_authenticated/instructors/new')({
  component: InstructorCreatePage,
});
