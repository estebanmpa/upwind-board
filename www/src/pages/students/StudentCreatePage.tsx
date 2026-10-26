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
        notifySuccess('Alumno creado');
        navigate({ to: '/alumnos/$studentId', params: { studentId: student.id } });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="Nuevo alumno"
        description="Cargá su ficha y contacto de emergencia"
      />
      <StudentForm
        submitLabel="Crear alumno"
        isSubmitting={createStudent.isPending}
        onSubmit={save}
      />
    </>
  );
}
