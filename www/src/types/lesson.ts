import type { PageParams, PersonSummary } from './api';
import type { SkillStatus } from './skill';
import type { WindDirection } from './wind';

export interface LessonSkillRecord {
  id: string;
  skillId: string;
  status: SkillStatus;
  notes: string | null;
}

export interface LessonStudent {
  id: string;
  studentId: string;
  student: PersonSummary;
  kiteSizeM2: number | null;
  board: string | null;
  notes: string | null;
  skillRecords: LessonSkillRecord[];
}

export interface Lesson {
  id: string;
  /** Null while a scheduled lesson waits for an instructor. */
  instructorId: string | null;
  instructor: PersonSummary | null;
  startsAt: string;
  durationMinutes: number;
  spot: string;
  windDirection: WindDirection | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
  notes: string | null;
  students: LessonStudent[];
  createdAt: string;
  updatedAt: string;
}

/** Body of POST /lessons; PATCH /lessons/:id accepts the same full state. */
export interface LessonPayload {
  instructorId: string | null;
  startsAt: string;
  durationMinutes: number;
  spot: string;
  windDirection: WindDirection | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
  notes: string | null;
  students: {
    studentId: string;
    kiteSizeM2: number | null;
    board: string | null;
    notes: string | null;
    skillRecords: { skillId: string; status: SkillStatus; notes: string | null }[];
  }[];
}

export interface LessonFilters extends PageParams {
  instructorId?: string;
  /** Only lessons without an instructor. */
  unassigned?: boolean;
  studentId?: string;
  from?: string;
  to?: string;
  /** By start date; the API defaults to 'desc'. */
  order?: 'asc' | 'desc';
}
