import { Center, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { LessonForm } from '@/components/lessons/LessonForm';
import { useCreateLesson } from '@/mutations/lessons';
import { studentQuery } from '@/queries/students';
import type { LessonPayload } from '@/types/lesson';
import { emptyLessonForm } from '@/utils/lesson-form';
import { notifyError, notifySuccess } from '@/utils/notifications';

/** @param studentId pre-adds a student (e.g. coming from their profile). */
export function LessonCreatePage({ studentId }: { studentId?: string }) {
  const createLesson = useCreateLesson();
  const navigate = useNavigate();
  const { data: student, isPending } = useQuery({
    ...studentQuery(studentId ?? ''),
    enabled: Boolean(studentId),
  });

  function save(payload: LessonPayload) {
    createLesson.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Lesson logged');
        navigate(
          studentId
            ? { to: '/students/$studentId', params: { studentId } }
            : { to: '/lessons' },
        );
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="Log lesson"
        description="Lesson details and what each student worked on"
      />
      {studentId && isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <LessonForm
          initialValues={emptyLessonForm(student ? [student] : [])}
          submitLabel="Save lesson"
          isSubmitting={createLesson.isPending}
          onSubmit={save}
        />
      )}
    </>
  );
}
