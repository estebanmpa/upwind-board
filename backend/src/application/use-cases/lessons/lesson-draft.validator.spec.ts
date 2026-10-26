import type { Mocked } from 'vitest';
import {
  instructorFixture,
  studentFixture,
} from '../../../../test/fakes/fixtures.js';
import { InMemorySkillRepository } from '../../../../test/fakes/in-memory-skill.repository.js';
import { Lesson, LessonDraft } from '../../../domain/entities/lesson.entity.js';
import { SkillStatus } from '../../../domain/entities/skill-status.enum.js';
import {
  BusinessRuleViolationError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { LessonDraftValidator } from './lesson-draft.validator.js';

describe('LessonDraftValidator', () => {
  const instructor = instructorFixture();
  const student = studentFixture();
  let instructors: Mocked<Pick<InstructorRepository, 'findById'>>;
  let students: Mocked<Pick<StudentRepository, 'findByIds'>>;
  let skills: InMemorySkillRepository;
  let validator: LessonDraftValidator;
  let leafId: string;
  let groupId: string;

  const draft = (overrides: Partial<LessonDraft> = {}): LessonDraft => ({
    instructorId: instructor.id,
    startsAt: new Date(),
    durationMinutes: 60,
    spot: 'Spot',
    windDirection: null,
    windMinKnots: null,
    windMaxKnots: null,
    notes: null,
    students: [
      {
        studentId: student.id,
        kiteSizeM2: null,
        board: null,
        notes: null,
        skillRecords: [
          { skillId: leafId, status: SkillStatus.Introduced, notes: null },
        ],
      },
    ],
    ...overrides,
  });

  const withRecords = (...skillIds: string[]): Partial<LessonDraft> => ({
    students: [
      {
        studentId: student.id,
        kiteSizeM2: null,
        board: null,
        notes: null,
        skillRecords: skillIds.map((skillId) => ({
          skillId,
          status: SkillStatus.Practiced,
          notes: null,
        })),
      },
    ],
  });

  beforeEach(() => {
    instructors = { findById: vi.fn().mockResolvedValue(instructor) };
    students = {
      findByIds: vi.fn(async (ids: string[]) =>
        ids.includes(student.id) ? [student] : [],
      ),
    };
    skills = new InMemorySkillRepository();
    groupId = skills.add({ code: 'L1' }).id;
    leafId = skills.add({ code: 'L1-A', parentId: groupId }).id;
    validator = new LessonDraftValidator(
      instructors as unknown as InstructorRepository,
      students as unknown as StudentRepository,
      skills,
    );
  });

  it('accepts a valid draft', async () => {
    await expect(validator.validate(draft())).resolves.toBeUndefined();
  });

  it('rejects skill records on non-leaf skills', async () => {
    await expect(
      validator.validate(draft(withRecords(groupId))),
    ).rejects.toThrow(/Only leaf skills/);
  });

  it('rejects unknown skills', async () => {
    await expect(
      validator.validate(
        draft(withRecords('00000000-0000-4000-8000-000000000000')),
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects the same skill twice for a student', async () => {
    await expect(
      validator.validate(draft(withRecords(leafId, leafId))),
    ).rejects.toBeInstanceOf(BusinessRuleViolationError);
  });

  it('rejects the same student twice', async () => {
    const base = draft();
    await expect(
      validator.validate({
        ...base,
        students: [base.students[0], base.students[0]],
      }),
    ).rejects.toThrow(/more than once/);
  });

  it('rejects unknown students', async () => {
    const base = draft();
    await expect(
      validator.validate({
        ...base,
        students: [{ ...base.students[0], studentId: 'missing' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects an unknown or inactive instructor', async () => {
    instructors.findById.mockResolvedValueOnce(null);
    await expect(validator.validate(draft())).rejects.toBeInstanceOf(
      NotFoundError,
    );
    instructors.findById.mockResolvedValueOnce(
      instructorFixture({ active: false }),
    );
    await expect(validator.validate(draft())).rejects.toThrow(/not active/);
  });

  it('keeps lessons of a deactivated instructor editable', async () => {
    instructors.findById.mockResolvedValue(
      instructorFixture({ active: false }),
    );
    const previous = {
      instructorId: instructor.id,
      students: [],
    } as unknown as Lesson;
    await expect(
      validator.validate(draft(), previous),
    ).resolves.toBeUndefined();
  });

  it('rejects a wind range where min is greater than max', async () => {
    await expect(
      validator.validate(draft({ windMinKnots: 20, windMaxKnots: 12 })),
    ).rejects.toBeInstanceOf(BusinessRuleViolationError);
  });

  it('rejects new records on inactive skills but keeps existing ones', async () => {
    await skills.update(leafId, { active: false });
    await expect(validator.validate(draft())).rejects.toThrow(/Inactive/);

    const previous = {
      instructorId: instructor.id,
      students: [
        {
          studentId: student.id,
          skillRecords: [{ skillId: leafId }],
        },
      ],
    } as unknown as Lesson;
    await expect(
      validator.validate(draft(), previous),
    ).resolves.toBeUndefined();
  });
});
