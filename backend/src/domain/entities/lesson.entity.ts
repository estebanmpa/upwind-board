import { SkillStatus } from './skill-status.enum.js';

export class LessonSkillRecord {
  id: string;
  skillId: string;
  status: SkillStatus;
  notes: string | null;
}

/** Read-only name of a related person, included for display. */
export class PersonSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export class LessonStudent {
  id: string;
  studentId: string;
  student: PersonSummary;
  kiteSizeM2: number | null;
  board: string | null;
  notes: string | null;
  skillRecords: LessonSkillRecord[];
}

/**
 * Aggregate root: a lesson owns its students and their skill records.
 * A lesson starting in the future is a scheduled one; its instructor can be
 * assigned later.
 */
export class Lesson {
  id: string;
  instructorId: string | null;
  instructor: PersonSummary | null;
  startsAt: Date;
  durationMinutes: number;
  spot: string;
  windDirection: string | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
  notes: string | null;
  students: LessonStudent[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Lesson) {
    Object.assign(this, props);
  }
}

type WithOptionalId<T> = Omit<T, 'id'> & { id?: string };

/**
 * Shape persisted by LessonRepository.save: children without id are inserted,
 * children with id are updated and the ones missing from the draft are removed.
 */
export type LessonDraft = WithOptionalId<
  Omit<Lesson, 'instructor' | 'students' | 'createdAt' | 'updatedAt'>
> & {
  students: (WithOptionalId<Omit<LessonStudent, 'student' | 'skillRecords'>> & {
    skillRecords: WithOptionalId<LessonSkillRecord>[];
  })[];
};
