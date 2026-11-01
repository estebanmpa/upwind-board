import { useMutation } from '@tanstack/react-query';
import { createLesson, deleteLesson, updateLesson } from '@/api/lessons-api';
import { queryKeys } from '@/queries/query-keys';
import type { LessonPayload } from '@/types/lesson';
import { useInvalidate } from './invalidate';

// Student progress and history are derived from lessons.
const useInvalidateLessons = () =>
  useInvalidate(queryKeys.lessons.all, queryKeys.students.all);

export function useCreateLesson() {
  const invalidate = useInvalidateLessons();
  return useMutation({
    mutationFn: (payload: LessonPayload) => createLesson(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateLesson(id: string) {
  const invalidate = useInvalidateLessons();
  return useMutation({
    mutationFn: (payload: LessonPayload) => updateLesson(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteLesson() {
  const invalidate = useInvalidateLessons();
  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: invalidate,
  });
}
