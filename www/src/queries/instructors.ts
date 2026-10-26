import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { fetchInstructor, fetchInstructors } from '@/api/instructors-api';
import type { InstructorFilters } from '@/types/instructor';
import { queryKeys } from './query-keys';

export const instructorsQuery = (filters: InstructorFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.instructors.list(filters),
    queryFn: () => fetchInstructors(filters),
    placeholderData: keepPreviousData,
  });

/** Options for instructor pickers (the API caps pages at 100). */
export const activeInstructorsQuery = () =>
  instructorsQuery({ active: true, limit: 100 });

export const instructorQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.instructors.detail(id),
    queryFn: () => fetchInstructor(id),
  });
