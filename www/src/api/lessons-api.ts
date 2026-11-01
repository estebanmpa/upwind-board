import type { Page } from '@/types/api';
import type { Lesson, LessonFilters, LessonPayload } from '@/types/lesson';
import { request } from './http';

export const fetchLessons = (filters: LessonFilters = {}) =>
  request<Page<Lesson>>('/lessons', { query: filters });

export const fetchLesson = (id: string) => request<Lesson>(`/lessons/${id}`);

export const createLesson = (payload: LessonPayload) =>
  request<Lesson>('/lessons', { method: 'POST', body: payload });

export const updateLesson = (id: string, payload: LessonPayload) =>
  request<Lesson>(`/lessons/${id}`, { method: 'PATCH', body: payload });

export const deleteLesson = (id: string) =>
  request<void>(`/lessons/${id}`, { method: 'DELETE' });
