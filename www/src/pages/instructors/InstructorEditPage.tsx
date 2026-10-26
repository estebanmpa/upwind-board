import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { InstructorForm } from '@/components/instructors/InstructorForm';
import { useUpdateInstructor } from '@/mutations/instructors';
import { instructorQuery } from '@/queries/instructors';
import type { InstructorInput } from '@/types/instructor';
import { fullName } from '@/utils/format';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function InstructorEditPage({ instructorId }: { instructorId: string }) {
  const { data: instructor } = useSuspenseQuery(instructorQuery(instructorId));
  const updateInstructor = useUpdateInstructor(instructorId);
  const navigate = useNavigate();

  function save(input: InstructorInput) {
    updateInstructor.mutate(input, {
      onSuccess: () => {
        notifySuccess('Changes saved');
        navigate({ to: '/instructors' });
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader title="Edit instructor" description={fullName(instructor)} />
      <InstructorForm
        instructor={instructor}
        submitLabel="Save changes"
        isSubmitting={updateInstructor.isPending}
        onSubmit={save}
      />
    </>
  );
}
