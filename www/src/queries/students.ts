import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';
import {
  fetchStudent,
  fetchStudentLessons,
  fetchStudentProgress,
  fetchStudents,
} from '@/api/students-api';
import type { StudentFilters } from '@/types/student';
import { queryKeys } from './query-keys';

const HISTORY_PAGE_SIZE = 10;

export const studentsQuery = (filters: StudentFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => fetchStudents(filters),
    placeholderData: keepPreviousData,
  });

export const studentQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => fetchStudent(id),
  });

export const studentProgressQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.students.progress(id),
    queryFn: () => fetchStudentProgress(id),
  });

export const studentLessonsQuery = (id: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.students.lessons(id, { limit: HISTORY_PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      fetchStudentLessons(id, { page: pageParam, limit: HISTORY_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });
