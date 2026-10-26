import { useMutation } from '@tanstack/react-query';
import {
  createInstructor,
  deleteInstructor,
  updateInstructor,
} from '@/api/instructors-api';
import { queryKeys } from '@/queries/query-keys';
import type { InstructorInput } from '@/types/instructor';
import { useInvalidate } from './invalidate';

export function useCreateInstructor() {
  const invalidate = useInvalidate(queryKeys.instructors.all);
  return useMutation({
    mutationFn: (input: InstructorInput) => createInstructor(input),
    onSuccess: invalidate,
  });
}

export function useUpdateInstructor(id: string) {
  // Lessons embed the instructor's name.
  const invalidate = useInvalidate(queryKeys.instructors.all, queryKeys.lessons.all);
  return useMutation({
    mutationFn: (input: InstructorInput) => updateInstructor(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteInstructor() {
  const invalidate = useInvalidate(queryKeys.instructors.all);
  return useMutation({
    mutationFn: (id: string) => deleteInstructor(id),
    onSuccess: invalidate,
  });
}
