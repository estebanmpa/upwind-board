import { createFileRoute } from '@tanstack/react-router';
import { LessonCreatePage } from '@/pages/lessons/LessonCreatePage';
import { newLessonSearchSchema } from '@/schemas/lesson-search-schema';

export const Route = createFileRoute('/_authenticated/lessons/new')({
  validateSearch: newLessonSearchSchema,
  component: LessonCreateRoute,
});

function LessonCreateRoute() {
  const { studentId } = Route.useSearch();
  return <LessonCreatePage studentId={studentId} />;
}
