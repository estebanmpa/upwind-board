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
        notifySuccess('Instructor created');
        navigate({ to: '/instructors' });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader title="New instructor" />
      <InstructorForm
        submitLabel="Create instructor"
        isSubmitting={createInstructor.isPending}
        onSubmit={save}
      />
    </>
  );
}
