import { createFileRoute } from '@tanstack/react-router';
import { StudentProfilePage } from '@/pages/students/StudentProfilePage';
import { studentProgressQuery, studentQuery } from '@/queries/students';
import { ensureOrNotFound } from '@/utils/router';

export const Route = createFileRoute('/_authenticated/alumnos/$studentId/')({
  loader: ({ context: { queryClient }, params: { studentId } }) =>
    ensureOrNotFound(
      Promise.all([
        queryClient.ensureQueryData(studentQuery(studentId)),
        queryClient.ensureQueryData(studentProgressQuery(studentId)),
      ]),
    ),
  component: StudentProfileRoute,
});

function StudentProfileRoute() {
  const { studentId } = Route.useParams();
  return <StudentProfilePage studentId={studentId} />;
}
