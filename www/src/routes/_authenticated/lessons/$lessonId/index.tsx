import { createFileRoute } from '@tanstack/react-router';
import { LessonViewPage } from '@/pages/lessons/LessonViewPage';
import { lessonQuery } from '@/queries/lessons';
import { skillTreeQuery } from '@/queries/skills';
import { ensureOrNotFound } from '@/utils/router';

export const Route = createFileRoute('/_authenticated/lessons/$lessonId/')({
  loader: ({ context: { queryClient }, params: { lessonId } }) =>
    ensureOrNotFound(
      Promise.all([
        queryClient.ensureQueryData(lessonQuery(lessonId)),
        // Names the recorded skills.
        queryClient.ensureQueryData(skillTreeQuery(true)),
      ]),
    ),
  component: LessonViewRoute,
});

function LessonViewRoute() {
  const { lessonId } = Route.useParams();
  return <LessonViewPage lessonId={lessonId} />;
}
