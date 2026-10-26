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
  const goToList = () => navigate({ to: '/clases' });

  function save(payload: LessonPayload) {
    updateLesson.mutate(payload, {
      onSuccess: () => {
        notifySuccess('Cambios guardados');
        goToList();
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="Editar clase"
        description={`${lesson.spot} · ${formatDateTime(lesson.startsAt)}`}
      />
      <LessonForm
        initialValues={lessonToFormValues(lesson)}
        currentInstructor={lesson.instructor}
        submitLabel="Guardar cambios"
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
                title: 'Eliminar clase',
                message:
                  'Se borran también los registros de habilidades de sus alumnos y su progresión se recalcula.',
                successMessage: 'Clase eliminada',
                onDeleted: goToList,
              })
            }
          >
            Eliminar clase
          </Button>
        }
      />
    </>
  );
}
