import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Equipment,
  EquipmentStatus,
  EquipmentType,
} from '../../../domain/entities/equipment.entity.js';
import { Lesson, LessonDraft } from '../../../domain/entities/lesson.entity.js';
import {
  BusinessRuleViolationError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { LessonDraftValidator } from './lesson-draft.validator.js';

const STUDENT_ID = '00000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-11-03T12:00:00Z');

const kite = (overrides: Partial<Equipment> = {}) =>
  new Equipment({
    id: 'kite-1',
    name: 'Rebel 9 #1',
    type: EquipmentType.Kite,
    brand: null,
    model: null,
    size: '9 m²',
    serialNumber: null,
    status: EquipmentStatus.Available,
    notes: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  });

const draft = (overrides: Partial<LessonDraft> = {}): LessonDraft => ({
  instructorId: null,
  startsAt: new Date('2026-11-04T15:00:00Z'),
  durationMinutes: 120,
  spot: 'Punta Lara',
  windDirection: null,
  windMinKnots: null,
  windMaxKnots: null,
  notes: null,
  equipmentIds: [],
  students: [
    {
      studentId: STUDENT_ID,
      kiteSizeM2: null,
      board: null,
      notes: null,
      skillRecords: [],
    },
  ],
  ...overrides,
});

describe('LessonDraftValidator — equipment', () => {
  let equipment: {
    findByIds: ReturnType<typeof vi.fn>;
    findBookings: ReturnType<typeof vi.fn>;
  };
  let validator: LessonDraftValidator;

  beforeEach(() => {
    equipment = {
      findByIds: vi.fn().mockResolvedValue([kite()]),
      findBookings: vi.fn().mockResolvedValue([]),
    };
    const students = {
      findByIds: vi.fn().mockResolvedValue([{ id: STUDENT_ID }]),
    };
    validator = new LessonDraftValidator(
      {} as InstructorRepository,
      students as unknown as StudentRepository,
      {} as SkillRepository,
      equipment as unknown as EquipmentRepository,
    );
  });

  it('accepts a lesson without equipment without querying it', async () => {
    await expect(validator.validate(draft(), undefined, NOW)).resolves.toBe(
      undefined,
    );
    expect(equipment.findByIds).not.toHaveBeenCalled();
  });

  it('accepts available equipment and checks bookings in the lesson window', async () => {
    await validator.validate(
      draft({ id: 'lesson-1', equipmentIds: ['kite-1'] }),
      undefined,
      NOW,
    );
    expect(equipment.findBookings).toHaveBeenCalledWith(
      ['kite-1'],
      new Date('2026-11-04T15:00:00Z'),
      new Date('2026-11-04T17:00:00Z'),
      'lesson-1',
    );
  });

  it('rejects equipment listed twice', async () => {
    await expect(
      validator.validate(
        draft({ equipmentIds: ['kite-1', 'kite-1'] }),
        undefined,
        NOW,
      ),
    ).rejects.toThrow(BusinessRuleViolationError);
  });

  it('rejects unknown equipment', async () => {
    await expect(
      validator.validate(draft({ equipmentIds: ['ghost'] }), undefined, NOW),
    ).rejects.toThrow(NotFoundError);
  });

  it('rejects newly assigned equipment that is not available', async () => {
    equipment.findByIds.mockResolvedValue([
      kite({ status: EquipmentStatus.Maintenance }),
    ]);
    await expect(
      validator.validate(draft({ equipmentIds: ['kite-1'] }), undefined, NOW),
    ).rejects.toThrow(/not available: Rebel 9 #1/);
  });

  it('keeps unavailable equipment already assigned to the lesson', async () => {
    equipment.findByIds.mockResolvedValue([
      kite({ status: EquipmentStatus.Retired }),
    ]);
    const previous = {
      instructorId: null,
      students: [],
      equipment: [
        { id: 'kite-1', name: 'Rebel 9 #1', type: 'kite', size: null },
      ],
    } as unknown as Lesson;
    await expect(
      validator.validate(
        draft({ id: 'lesson-1', equipmentIds: ['kite-1'] }),
        previous,
        NOW,
      ),
    ).resolves.toBe(undefined);
  });

  it('rejects equipment booked in an overlapping lesson', async () => {
    equipment.findBookings.mockResolvedValue([
      { equipmentId: 'kite-1', lessonId: 'other-lesson' },
    ]);
    await expect(
      validator.validate(draft({ equipmentIds: ['kite-1'] }), undefined, NOW),
    ).rejects.toThrow(/another lesson at that time: Rebel 9 #1/);
  });
});
