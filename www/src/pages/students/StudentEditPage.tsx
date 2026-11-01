import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StudentForm } from '@/components/students/StudentForm';
import { useUpdateStudent } from '@/mutations/students';
import { studentQuery } from '@/queries/students';
import type { StudentInput } from '@/types/student';
import { fullName } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function StudentEditPage({ studentId }: { studentId: string }) {
  const { data: student } = useSuspenseQuery(studentQuery(studentId));
  const updateStudent = useUpdateStudent(studentId);
  const navigate = useNavigate();

  function save(input: StudentInput) {
    updateStudent.mutate(input, {
      onSuccess: () => {
        notifySuccess('Changes saved');
        navigate({ to: '/students/$studentId', params: { studentId } });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader title="Edit student" description={fullName(student)} />
      <StudentForm
        student={student}
        submitLabel="Save changes"
        isSubmitting={updateStudent.isPending}
        onSubmit={save}
      />
    </>
  );
}
