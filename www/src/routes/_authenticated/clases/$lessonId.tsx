import { createFileRoute } from '@tanstack/react-router';
import { LessonEditPage } from '@/pages/lessons/LessonEditPage';
import { lessonQuery } from '@/queries/lessons';
import { ensureOrNotFound } from '@/utils/router';

export const Route = createFileRoute('/_authenticated/clases/$lessonId')({
  loader: ({ context: { queryClient }, params: { lessonId } }) =>
    ensureOrNotFound(queryClient.ensureQueryData(lessonQuery(lessonId))),
  component: LessonEditRoute,
});

function LessonEditRoute() {
  const { lessonId } = Route.useParams();
  // Keyed so navigating between lessons resets the form.
  return <LessonEditPage key={lessonId} lessonId={lessonId} />;
}
