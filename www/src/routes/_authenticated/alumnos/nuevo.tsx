import { createFileRoute } from '@tanstack/react-router';
import { StudentCreatePage } from '@/pages/students/StudentCreatePage';

export const Route = createFileRoute('/_authenticated/alumnos/nuevo')({
  component: StudentCreatePage,
});
