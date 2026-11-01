import type { PageParams } from './api';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  /** YYYY-MM-DD */
  birthDate: string | null;
  weightKg: number | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

export interface StudentFilters extends PageParams {
  search?: string;
}
