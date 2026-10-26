import { Student, StudentData } from '../entities/student.entity.js';
import { Page, PageRequest } from './pagination.js';

export interface StudentFilter {
  /** Case-insensitive match on first name, last name or full name. */
  search?: string;
}

export abstract class StudentRepository {
  abstract findById(id: string): Promise<Student | null>;
  abstract findByIds(ids: string[]): Promise<Student[]>;
  abstract findPage(
    filter: StudentFilter,
    request: PageRequest,
  ): Promise<Page<Student>>;
  abstract hasLessons(id: string): Promise<boolean>;
  abstract create(data: StudentData): Promise<Student>;
  abstract update(id: string, changes: Partial<StudentData>): Promise<Student>;
  abstract delete(id: string): Promise<void>;
}
