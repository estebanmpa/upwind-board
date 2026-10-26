import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useCreateInstructor } from '@/mutations/instructors';
import type { InstructorInput } from '@/types/instructor';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function InstructorCreatePage() {
  const createInstructor = useCreateInstructor();
  const navigate = useNavigate();

  function save(input: InstructorInput) {
    createInstructor.mutate(input, {
      onSuccess: () => {
        notifySuccess('Instructor creado');
        navigate({ to: '/instructores' });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader title="Nuevo instructor" />
      <InstructorForm
        submitLabel="Crear instructor"
        isSubmitting={createInstructor.isPending}
        onSubmit={save}
      />
    </>
  );
}
