import { Button } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { LessonForm } from '@/components/lessons/LessonForm';
import { useGoBack } from '@/hooks/useGoBack';
import { useUpdateLesson } from '@/mutations/lessons';
import { lessonQuery } from '@/queries/lessons';
import type { LessonPayload } from '@/types/lesson';
import { formatDateTime } from '@/utils/format';
import { lessonToFormValues } from '@/utils/lesson-form';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function LessonEditPage({ lessonId }: { lessonId: string }) {
  const { data: lesson } = useSuspenseQuery(lessonQuery(lessonId));
  const updateLesson = useUpdateLesson(lessonId);
  const lessonView = { to: '/lessons/$lessonId', params: { lessonId } } as const;
  const goBack = useGoBack(lessonView);

  function save(payload: LessonPayload) {
    updateLesson.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Changes saved');
        goBack();
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        back={lessonView}
        title="Edit lesson"
        description={`${lesson.spot} · ${formatDateTime(lesson.startsAt)}`}
      />
      <LessonForm
        initialValues={lessonToFormValues(lesson)}
        currentInstructor={lesson.instructor ?? undefined}
        currentEquipment={lesson.equipment}
        submitLabel="Save changes"
        isSubmitting={updateLesson.isPending}
        onSubmit={save}
        extraActions={
          <Button variant="default" fullWidth onClick={goBack}>
            Cancel
          </Button>
        }
      />
    </>
  );
}
