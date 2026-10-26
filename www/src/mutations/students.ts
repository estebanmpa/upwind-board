import { useMutation } from '@tanstack/react-query';
import { createStudent, deleteStudent, updateStudent } from '@/api/students-api';
import { queryKeys } from '@/queries/query-keys';
import type { StudentInput } from '@/types/student';
import { useInvalidate } from './invalidate';

export function useCreateStudent() {
  const invalidate = useInvalidate(queryKeys.students.all);
  return useMutation({
    mutationFn: (input: StudentInput) => createStudent(input),
    onSuccess: invalidate,
  });
}

export function useUpdateStudent(id: string) {
  // Lessons embed the student's name.
  const invalidate = useInvalidate(queryKeys.students.all, queryKeys.lessons.all);
  return useMutation({
    mutationFn: (input: StudentInput) => updateStudent(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStudent() {
  const invalidate = useInvalidate(queryKeys.students.all);
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: invalidate,
  });
}
