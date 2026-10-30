import { Injectable } from '@nestjs/common';
import { Lesson, LessonDraft } from '../../../domain/entities/lesson.entity.js';
import {
  BusinessRuleViolationError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';

const duplicates = (values: string[]) => [
  ...new Set(values.filter((v, i) => values.indexOf(v) !== i)),
];

/** Checks a lesson draft against the rest of the model before saving it. */
@Injectable()
export class LessonDraftValidator {
  constructor(
    private readonly instructors: InstructorRepository,
    private readonly students: StudentRepository,
    private readonly skills: SkillRepository,
  ) {}

  /**
   * @param previous current state of the lesson when updating.
   * @param now reference instant to tell scheduled lessons from past ones.
   */
  async validate(
    draft: LessonDraft,
    previous?: Lesson,
    now = new Date(),
  ): Promise<void> {
    this.validateWindRange(draft);
    this.validateRecordsCanBeLogged(draft, now);
    await this.validateInstructor(draft, previous);
    await this.validateStudents(draft);
    await this.validateSkillRecords(draft, previous);
  }

  /**
   * Progression is derived from skill records, so they are only accepted for
   * lessons that already started and have an instructor who taught them.
   */
  private validateRecordsCanBeLogged(draft: LessonDraft, now: Date) {
    const hasRecords = draft.students.some((s) => s.skillRecords.length > 0);
    if (!hasRecords) return;
    if (draft.startsAt > now) {
      throw new BusinessRuleViolationError(
        'Skills cannot be recorded for a lesson that has not started yet',
      );
    }
    if (draft.instructorId === null) {
      throw new BusinessRuleViolationError(
        'Assign an instructor before recording skills',
      );
    }
  }

  private validateWindRange({ windMinKnots, windMaxKnots }: LessonDraft) {
    if (
      windMinKnots !== null &&
      windMaxKnots !== null &&
      windMinKnots > windMaxKnots
    ) {
      throw new BusinessRuleViolationError(
        'windMinKnots cannot be greater than windMaxKnots',
      );
    }
  }

  private async validateInstructor(draft: LessonDraft, previous?: Lesson) {
    if (draft.instructorId === null) return;
    const instructor = await this.instructors.findById(draft.instructorId);
    if (!instructor) throw new NotFoundError('Instructor', draft.instructorId);
    // Lessons already assigned to an instructor stay editable after they leave.
    const isNewAssignment = previous?.instructorId !== draft.instructorId;
    if (isNewAssignment && !instructor.active) {
      throw new BusinessRuleViolationError(
        `Instructor "${instructor.email}" is not active`,
      );
    }
  }

  private async validateStudents(draft: LessonDraft) {
    const ids = draft.students.map((s) => s.studentId);
    const repeated = duplicates(ids);
    if (repeated.length > 0) {
      throw new BusinessRuleViolationError(
        `Students listed more than once: ${repeated.join(', ')}`,
      );
    }
    const found = new Set(
      (await this.students.findByIds(ids)).map((s) => s.id),
    );
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length > 0)
      throw new NotFoundError('Student', missing.join(', '));
  }

  private async validateSkillRecords(draft: LessonDraft, previous?: Lesson) {
    for (const student of draft.students) {
      const repeated = duplicates(student.skillRecords.map((r) => r.skillId));
      if (repeated.length > 0) {
        throw new BusinessRuleViolationError(
          `Skills recorded more than once for student ${student.studentId}: ${repeated.join(', ')}`,
        );
      }
    }

    const skillIds = [
      ...new Set(
        draft.students.flatMap((s) => s.skillRecords.map((r) => r.skillId)),
      ),
    ];
    if (skillIds.length === 0) return;

    const skills = await this.skills.findByIds(skillIds);
    const found = new Map(skills.map((s) => [s.id, s]));
    const missing = skillIds.filter((id) => !found.has(id));
    if (missing.length > 0)
      throw new NotFoundError('Skill', missing.join(', '));

    const groups = await this.skills.findIdsWithChildren(skillIds);
    if (groups.length > 0) {
      const codes = groups.map((id) => found.get(id)!.code);
      throw new BusinessRuleViolationError(
        `Only leaf skills can be recorded; these group other skills: ${codes.join(', ')}`,
      );
    }

    // Inactive skills cannot be recorded anew, but records that already exist
    // in the lesson can be kept when it is edited.
    const existingPairs = new Set(
      (previous?.students ?? []).flatMap((s) =>
        s.skillRecords.map((r) => `${s.studentId}:${r.skillId}`),
      ),
    );
    const inactive = draft.students.flatMap((s) =>
      s.skillRecords
        .filter(
          (r) =>
            !found.get(r.skillId)!.active &&
            !existingPairs.has(`${s.studentId}:${r.skillId}`),
        )
        .map((r) => found.get(r.skillId)!.code),
    );
    if (inactive.length > 0) {
      throw new BusinessRuleViolationError(
        `Inactive skills cannot be recorded: ${[...new Set(inactive)].join(', ')}`,
      );
    }
  }
}
