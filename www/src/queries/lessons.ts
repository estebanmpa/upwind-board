import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { fetchLesson, fetchLessons } from '@/api/lessons-api';
import type { LessonFilters } from '@/types/lesson';
import { queryKeys } from './query-keys';

export const lessonsQuery = (filters: LessonFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.lessons.list(filters),
    queryFn: () => fetchLessons(filters),
    placeholderData: keepPreviousData,
  });

export const lessonQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.lessons.detail(id),
    queryFn: () => fetchLesson(id),
  });
