import { createFileRoute } from '@tanstack/react-router';
import { InstructorEditPage } from '@/pages/instructors/InstructorEditPage';
import { instructorQuery } from '@/queries/instructors';
import { ensureOrNotFound } from '@/utils/router';

export const Route = createFileRoute('/_authenticated/instructores/$instructorId')({
  loader: ({ context: { queryClient }, params: { instructorId } }) =>
    ensureOrNotFound(queryClient.ensureQueryData(instructorQuery(instructorId))),
  component: InstructorEditRoute,
});

function InstructorEditRoute() {
  const { instructorId } = Route.useParams();
  return <InstructorEditPage instructorId={instructorId} />;
}
