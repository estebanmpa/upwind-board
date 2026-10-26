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
        notifySuccess('Clase registrada');
        navigate(
          studentId
            ? { to: '/alumnos/$studentId', params: { studentId } }
            : { to: '/clases' },
        );
      },
      onError: notifyError,
    });
  }

  return (
    <>
      <PageHeader
        title="Registrar clase"
        description="Datos de la clase y lo que trabajó cada alumno"
      />
      {studentId && isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <LessonForm
          initialValues={emptyLessonForm(student ? [student] : [])}
          submitLabel="Guardar clase"
          isSubmitting={createLesson.isPending}
          onSubmit={save}
        />
      )}
    </>
  );
}
