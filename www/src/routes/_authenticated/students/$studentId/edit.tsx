import { createFileRoute } from '@tanstack/react-router';
import { StudentEditPage } from '@/pages/students/StudentEditPage';
import { studentQuery } from '@/queries/students';
import { ensureOrNotFound } from '@/utils/router';

export const Route = createFileRoute('/_authenticated/students/$studentId/edit')({
  loader: ({ context: { queryClient }, params: { studentId } }) =>
    ensureOrNotFound(queryClient.ensureQueryData(studentQuery(studentId))),
  component: StudentEditRoute,
});

function StudentEditRoute() {
  const { studentId } = Route.useParams();
  return <StudentEditPage studentId={studentId} />;
}
