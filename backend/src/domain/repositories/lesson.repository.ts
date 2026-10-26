import { Lesson, LessonDraft } from '../entities/lesson.entity.js';
import { SkillStatus } from '../entities/skill-status.enum.js';
import { Page, PageRequest } from './pagination.js';

export interface LessonFilter {
  instructorId?: string;
  studentId?: string;
  from?: Date;
  to?: Date;
}

/** One skill record of a student, with the lesson date used to order them. */
export interface SkillRecordHistoryEntry {
  skillId: string;
  status: SkillStatus;
  lessonId: string;
  lessonStartsAt: Date;
  recordedAt: Date;
}

export interface StudentLessonStats {
  totalLessons: number;
  totalMinutes: number;
}

export abstract class LessonRepository {
  abstract findById(id: string): Promise<Lesson | null>;
  /** Ordered by starts_at, most recent first. */
  abstract findPage(
    filter: LessonFilter,
    request: PageRequest,
  ): Promise<Page<Lesson>>;
  /** Inserts or updates the whole aggregate in a single transaction. */
  abstract save(draft: LessonDraft): Promise<Lesson>;
  abstract delete(id: string): Promise<void>;
  abstract findSkillRecordHistory(
    studentId: string,
  ): Promise<SkillRecordHistoryEntry[]>;
  abstract getStudentStats(studentId: string): Promise<StudentLessonStats>;
}
