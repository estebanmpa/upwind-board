import type { LessonFormValues, LessonStudentFormValues } from '@/schemas/lesson-schema';
import type { PersonSummary } from '@/types/api';
import type { Lesson, LessonPayload } from '@/types/lesson';
import { emptyToNull } from './form';

const DEFAULT_DURATION_MINUTES = 120;

/** Next full hour, a sensible default for a new lesson. */
function nextFullHour(now: Date): Date {
  const date = new Date(now);
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}

export function emptyLessonStudent(student: PersonSummary): LessonStudentFormValues {
  return {
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    kiteSizeM2: null,
    board: '',
    notes: '',
    records: {},
  };
}

export function emptyLessonForm(
  students: PersonSummary[] = [],
  now = new Date(),
): Partial<LessonFormValues> {
  return {
    instructorId: null,
    startsAt: nextFullHour(now),
    durationMinutes: DEFAULT_DURATION_MINUTES,
    spot: '',
    windDirection: null,
    windMinKnots: null,
    windMaxKnots: null,
    notes: '',
    students: students.map(emptyLessonStudent),
  };
}

export function lessonToFormValues(lesson: Lesson): LessonFormValues {
  return {
    instructorId: lesson.instructorId,
    startsAt: new Date(lesson.startsAt),
    durationMinutes: lesson.durationMinutes,
    spot: lesson.spot,
    windDirection: lesson.windDirection,
    windMinKnots: lesson.windMinKnots,
    windMaxKnots: lesson.windMaxKnots,
    notes: lesson.notes ?? '',
    students: lesson.students.map((participation) => ({
      studentId: participation.studentId,
      firstName: participation.student.firstName,
      lastName: participation.student.lastName,
      kiteSizeM2: participation.kiteSizeM2,
      board: participation.board ?? '',
      notes: participation.notes ?? '',
      records: Object.fromEntries(
        participation.skillRecords.map((record) => [
          record.skillId,
          { status: record.status, notes: record.notes },
        ]),
      ),
    })),
  };
}

/** Full lesson state, valid for both POST and PATCH. */
export function formValuesToPayload(values: LessonFormValues): LessonPayload {
  return {
    instructorId: values.instructorId,
    startsAt: values.startsAt.toISOString(),
    durationMinutes: values.durationMinutes,
    spot: values.spot.trim(),
    windDirection: values.windDirection,
    windMinKnots: values.windMinKnots,
    windMaxKnots: values.windMaxKnots,
    notes: emptyToNull(values.notes),
    students: values.students.map((student) => ({
      studentId: student.studentId,
      kiteSizeM2: student.kiteSizeM2,
      board: emptyToNull(student.board),
      notes: emptyToNull(student.notes),
      skillRecords: Object.entries(student.records).map(([skillId, record]) => ({
        skillId,
        status: record.status,
        notes: record.notes,
      })),
    })),
  };
}

export function countRecords(students: LessonStudentFormValues[]): number {
  return students.reduce(
    (total, student) => total + Object.keys(student.records).length,
    0,
  );
}
