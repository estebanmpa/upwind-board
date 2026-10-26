import type { PageParams } from './api';

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ikoInstructorId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InstructorInput = Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>;

export interface InstructorFilters extends PageParams {
  search?: string;
  active?: boolean;
}
