import {
  Lesson,
  LessonSkillRecord,
  LessonStudent,
  PersonSummary,
} from '../../../../domain/entities/lesson.entity.js';
import { LessonSkillRecordOrmEntity } from '../entities/lesson-skill-record.orm-entity.js';
import { LessonStudentOrmEntity } from '../entities/lesson-student.orm-entity.js';
import { LessonOrmEntity } from '../entities/lesson.orm-entity.js';

const byCreation = (
  a: { createdAt: Date; id: string },
  b: { createdAt: Date; id: string },
) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);

const toPersonSummary = (person: {
  id: string;
  firstName: string;
  lastName: string;
}): PersonSummary => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName,
});

export class LessonMapper {
  /** Expects `instructor` (when assigned), `students.student` and `students.skillRecords` loaded. */
  static toDomain(entity: LessonOrmEntity): Lesson {
    return new Lesson({
      id: entity.id,
      instructorId: entity.instructorId,
      instructor: entity.instructor ? toPersonSummary(entity.instructor) : null,
      startsAt: entity.startsAt,
      durationMinutes: entity.durationMinutes,
      spot: entity.spot,
      windDirection: entity.windDirection,
      windMinKnots: entity.windMinKnots,
      windMaxKnots: entity.windMaxKnots,
      notes: entity.notes,
      students: [...(entity.students ?? [])]
        .sort(byCreation)
        .map((s) => LessonMapper.studentToDomain(s)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private static studentToDomain(
    entity: LessonStudentOrmEntity,
  ): LessonStudent {
    return {
      id: entity.id,
      studentId: entity.studentId,
      student: toPersonSummary(entity.student!),
      kiteSizeM2: entity.kiteSizeM2,
      board: entity.board,
      notes: entity.notes,
      skillRecords: [...(entity.skillRecords ?? [])]
        .sort(byCreation)
        .map((r) => LessonMapper.recordToDomain(r)),
    };
  }

  private static recordToDomain(
    entity: LessonSkillRecordOrmEntity,
  ): LessonSkillRecord {
    return {
      id: entity.id,
      skillId: entity.skillId,
      status: entity.status,
      notes: entity.notes,
    };
  }
}
