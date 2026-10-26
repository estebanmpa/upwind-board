import { Lesson, LessonDraft } from '../../domain/entities/lesson.entity.js';
import { CreateLessonDto } from '../dtos/lessons/create-lesson.dto.js';
import {
  LessonSkillRecordInputDto,
  LessonStudentInputDto,
} from '../dtos/lessons/lesson-input.dto.js';
import { UpdateLessonDto } from '../dtos/lessons/update-lesson.dto.js';

type DraftStudent = LessonDraft['students'][number];
type DraftRecord = DraftStudent['skillRecords'][number];

/** `undefined` means "not sent": keep the current value. */
const pick = <T>(sent: T | undefined, current: T): T =>
  sent === undefined ? current : sent;

const newRecord = (input: LessonSkillRecordInputDto): DraftRecord => ({
  skillId: input.skillId,
  status: input.status,
  notes: input.notes ?? null,
});

const newStudent = (input: LessonStudentInputDto): DraftStudent => ({
  studentId: input.studentId,
  kiteSizeM2: input.kiteSizeM2 ?? null,
  board: input.board ?? null,
  notes: input.notes ?? null,
  skillRecords: (input.skillRecords ?? []).map(newRecord),
});

export function createLessonDraft(dto: CreateLessonDto): LessonDraft {
  return {
    instructorId: dto.instructorId,
    startsAt: new Date(dto.startsAt),
    durationMinutes: dto.durationMinutes,
    spot: dto.spot,
    windDirection: dto.windDirection ?? null,
    windMinKnots: dto.windMinKnots ?? null,
    windMaxKnots: dto.windMaxKnots ?? null,
    notes: dto.notes ?? null,
    students: dto.students.map(newStudent),
  };
}

/**
 * Applies a PATCH to an existing lesson. Rows are matched by student id and
 * skill id so they keep their ids; whatever is missing from a provided list is
 * removed when the draft is saved.
 */
export function mergeLessonDraft(
  lesson: Lesson,
  dto: UpdateLessonDto,
): LessonDraft {
  const currentStudents = new Map(lesson.students.map((s) => [s.studentId, s]));

  const students =
    dto.students === undefined
      ? lesson.students
      : dto.students.map((input): DraftStudent => {
          const current = currentStudents.get(input.studentId);
          if (!current) return newStudent(input);

          const currentRecords = new Map(
            current.skillRecords.map((r) => [r.skillId, r]),
          );
          return {
            id: current.id,
            studentId: current.studentId,
            kiteSizeM2: pick(input.kiteSizeM2, current.kiteSizeM2),
            board: pick(input.board, current.board),
            notes: pick(input.notes, current.notes),
            skillRecords:
              input.skillRecords === undefined
                ? current.skillRecords
                : input.skillRecords.map((record) => ({
                    ...newRecord(record),
                    id: currentRecords.get(record.skillId)?.id,
                  })),
          };
        });

  return {
    id: lesson.id,
    instructorId: pick(dto.instructorId, lesson.instructorId),
    startsAt:
      dto.startsAt === undefined ? lesson.startsAt : new Date(dto.startsAt),
    durationMinutes: pick(dto.durationMinutes, lesson.durationMinutes),
    spot: pick(dto.spot, lesson.spot),
    windDirection: pick(dto.windDirection, lesson.windDirection),
    windMinKnots: pick(dto.windMinKnots, lesson.windMinKnots),
    windMaxKnots: pick(dto.windMaxKnots, lesson.windMaxKnots),
    notes: pick(dto.notes, lesson.notes),
    students,
  };
}
