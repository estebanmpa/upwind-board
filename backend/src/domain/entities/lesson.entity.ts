import { SkillStatus } from './skill-status.enum.js';

export class LessonSkillRecord {
  id: string;
  skillId: string;
  status: SkillStatus;
  notes: string | null;
}

export class LessonStudent {
  id: string;
  studentId: string;
  kiteSizeM2: number | null;
  board: string | null;
  notes: string | null;
  skillRecords: LessonSkillRecord[];
}

/** Aggregate root: a lesson owns its students and their skill records. */
export class Lesson {
  id: string;
  instructorId: string;
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
  Omit<Lesson, 'students' | 'createdAt' | 'updatedAt'>
> & {
  students: (WithOptionalId<Omit<LessonStudent, 'skillRecords'>> & {
    skillRecords: WithOptionalId<LessonSkillRecord>[];
  })[];
};
