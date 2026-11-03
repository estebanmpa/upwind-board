import { describe, expect, it } from 'vitest';
import type { Lesson } from '@/types/lesson';
import { emptyLessonForm, formValuesToPayload, lessonToFormValues } from './lesson-form';

const lesson: Lesson = {
  id: 'l1',
  instructorId: null,
  instructor: null,
  startsAt: '2026-11-04T15:00:00.000Z',
  durationMinutes: 120,
  spot: 'Punta Lara',
  windDirection: null,
  windMinKnots: null,
  windMaxKnots: null,
  notes: null,
  students: [],
  equipment: [{ id: 'k1', name: 'Rebel', type: 'kite', size: '9 m²' }],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

describe('lesson form equipment', () => {
  it('starts a new lesson without equipment', () => {
    expect(emptyLessonForm().equipmentIds).toEqual([]);
  });

  it('round-trips the assigned equipment ids', () => {
    const values = lessonToFormValues(lesson);
    expect(values.equipmentIds).toEqual(['k1']);
    expect(formValuesToPayload(values).equipmentIds).toEqual(['k1']);
  });
});
