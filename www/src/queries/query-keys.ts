import type { PageParams } from '@/types/api';
import type { InstructorFilters } from '@/types/instructor';
import type { LessonFilters } from '@/types/lesson';
import type { StudentFilters } from '@/types/student';

export const queryKeys = {
  instructors: {
    all: ['instructors'] as const,
    list: (filters: InstructorFilters) => ['instructors', 'list', filters] as const,
    detail: (id: string) => ['instructors', 'detail', id] as const,
  },
  students: {
    all: ['students'] as const,
    list: (filters: StudentFilters) => ['students', 'list', filters] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
    progress: (id: string) => ['students', 'progress', id] as const,
    lessons: (id: string, params: PageParams) =>
      ['students', 'lessons', id, params] as const,
  },
  skills: {
    all: ['skills'] as const,
    tree: (includeInactive: boolean) => ['skills', 'tree', { includeInactive }] as const,
  },
  lessons: {
    all: ['lessons'] as const,
    list: (filters: LessonFilters) => ['lessons', 'list', filters] as const,
    detail: (id: string) => ['lessons', 'detail', id] as const,
  },
};
