import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { LessonForm } from '@/components/lessons/LessonForm';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useDeleteLesson, useUpdateLesson } from '@/mutations/lessons';
import { lessonQuery } from '@/queries/lessons';
import type { LessonPayload } from '@/types/lesson';
import { formatDateTime } from '@/utils/format';
import { lessonToFormValues } from '@/utils/lesson-form';
import { notifyError, notifySuccess } from '@/utils/notifications';

export function LessonEditPage({ lessonId }: { lessonId: string }) {
  const { data: lesson } = useSuspenseQuery(lessonQuery(lessonId));
  const updateLesson = useUpdateLesson(lessonId);
  const deleteLesson = useDeleteLesson();
  const confirmDelete = useConfirmDelete(deleteLesson);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: '/lessons' });

  function save(payload: LessonPayload) {
    updateLesson.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Changes saved');
        goToList();
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="Edit lesson"
        description={`${lesson.spot} · ${formatDateTime(lesson.startsAt)}`}
      />
      <LessonForm
        initialValues={lessonToFormValues(lesson)}
        currentInstructor={lesson.instructor ?? undefined}
        submitLabel="Save changes"
        isSubmitting={updateLesson.isPending}
        onSubmit={save}
        extraActions={
          <Button
            variant="subtle"
            color="red"
            fullWidth
            loading={deleteLesson.isPending}
            leftSection={<IconTrash size={18} />}
            onClick={() =>
              confirmDelete(lessonId, {
                title: 'Delete lesson',
                message:
                  "Its students' skill records are deleted too and their progression is recalculated.",
                successMessage: 'Lesson deleted',
                onDeleted: goToList,
              })
            }
          >
            Delete lesson
          </Button>
        }
      />
    </>
  );
}
