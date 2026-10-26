import type { Page, PageParams } from '@/types/api';
import type { StudentLessonHistoryItem, StudentProgress } from '@/types/progress';
import type { Student, StudentFilters, StudentInput } from '@/types/student';
import { request } from './http';

export const fetchStudents = (filters: StudentFilters = {}) =>
  request<Page<Student>>('/students', { query: filters });

export const fetchStudent = (id: string) => request<Student>(`/students/${id}`);

export const createStudent = (input: StudentInput) =>
  request<Student>('/students', { method: 'POST', body: input });

export const updateStudent = (id: string, input: StudentInput) =>
  request<Student>(`/students/${id}`, { method: 'PATCH', body: input });

export const deleteStudent = (id: string) =>
  request<void>(`/students/${id}`, { method: 'DELETE' });

export const fetchStudentProgress = (id: string) =>
  request<StudentProgress>(`/students/${id}/progress`);

export const fetchStudentLessons = (id: string, params: PageParams = {}) =>
  request<Page<StudentLessonHistoryItem>>(`/students/${id}/lessons`, { query: params });
