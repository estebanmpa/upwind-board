import { describe, expect, it } from 'vitest';
import { EquipmentType } from '../../domain/entities/equipment.entity.js';
import { Lesson } from '../../domain/entities/lesson.entity.js';
import { CreateLessonDto } from '../dtos/lessons/create-lesson.dto.js';
import { createLessonDraft, mergeLessonDraft } from './lesson-draft.factory.js';

const createDto = (overrides: Partial<CreateLessonDto> = {}) =>
  Object.assign(new CreateLessonDto(), {
    startsAt: '2026-11-04T15:00:00Z',
    durationMinutes: 120,
    spot: 'Punta Lara',
    students: [],
    ...overrides,
  });

const lesson = new Lesson({
  id: 'lesson-1',
  instructorId: null,
  instructor: null,
  startsAt: new Date('2026-11-04T15:00:00Z'),
  durationMinutes: 120,
  spot: 'Punta Lara',
  windDirection: null,
  windMinKnots: null,
  windMaxKnots: null,
  notes: null,
  students: [],
  equipment: [
    { id: 'kite-1', name: 'Rebel 9', type: EquipmentType.Kite, size: '9 m²' },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('lesson draft equipment', () => {
  it('defaults to no equipment on create', () => {
    expect(createLessonDraft(createDto()).equipmentIds).toEqual([]);
  });

  it('uses the sent equipment on create', () => {
    expect(
      createLessonDraft(createDto({ equipmentIds: ['board-1'] })).equipmentIds,
    ).toEqual(['board-1']);
  });

  it('keeps the current equipment when the update omits it', () => {
    expect(mergeLessonDraft(lesson, {}).equipmentIds).toEqual(['kite-1']);
  });

  it('replaces the equipment when the update sends it', () => {
    expect(mergeLessonDraft(lesson, { equipmentIds: [] }).equipmentIds).toEqual(
      [],
    );
  });
});
