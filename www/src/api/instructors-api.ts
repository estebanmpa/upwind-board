import type { Page } from '@/types/api';
import type { Instructor, InstructorFilters, InstructorInput } from '@/types/instructor';
import { request } from './http';

export const fetchInstructors = (filters: InstructorFilters = {}) =>
  request<Page<Instructor>>('/instructors', { query: filters });

export const fetchInstructor = (id: string) => request<Instructor>(`/instructors/${id}`);

export const createInstructor = (input: InstructorInput) =>
  request<Instructor>('/instructors', { method: 'POST', body: input });

export const updateInstructor = (id: string, input: InstructorInput) =>
  request<Instructor>(`/instructors/${id}`, { method: 'PATCH', body: input });

export const deleteInstructor = (id: string) =>
  request<void>(`/instructors/${id}`, { method: 'DELETE' });
