import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StudentForm } from '@/components/students/StudentForm';
import { useCreateStudent } from '@/mutations/students';
import type { StudentInput } from '@/types/student';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function StudentCreatePage() {
  const createStudent = useCreateStudent();
  const navigate = useNavigate();

  function save(input: StudentInput) {
    createStudent.mutate(input, {
      onSuccess: (student) => {
        notifySuccess('Student created');
        navigate({ to: '/students/$studentId', params: { studentId: student.id } });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="New student"
        description="Name and email are enough; the rest can be completed later"
      />
      <StudentForm
        submitLabel="Create student"
        isSubmitting={createStudent.isPending}
        onSubmit={save}
      />
    </>
  );
}
