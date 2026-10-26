import { Instructor, InstructorData } from '../entities/instructor.entity.js';
import { Page, PageRequest } from './pagination.js';

export interface InstructorFilter {
  /** Case-insensitive match on first name, last name or full name. */
  search?: string;
  active?: boolean;
}

export abstract class InstructorRepository {
  abstract findById(id: string): Promise<Instructor | null>;
  abstract findByIds(ids: string[]): Promise<Instructor[]>;
  abstract findByEmail(email: string): Promise<Instructor | null>;
  abstract findPage(
    filter: InstructorFilter,
    request: PageRequest,
  ): Promise<Page<Instructor>>;
  abstract hasLessons(id: string): Promise<boolean>;
  abstract create(data: InstructorData): Promise<Instructor>;
  abstract update(
    id: string,
    changes: Partial<InstructorData>,
  ): Promise<Instructor>;
  abstract delete(id: string): Promise<void>;
}
