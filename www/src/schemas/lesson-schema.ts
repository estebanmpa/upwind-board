import { z } from 'zod';
import { SKILL_STATUSES } from '@/types/skill';
import { WIND_DIRECTIONS } from '@/types/wind';

const knots = z.number().int().min(0, 'Minimum 0').max(99, 'Maximum 99').nullable();

export const skillRecordValueSchema = z.object({
  status: z.enum(SKILL_STATUSES),
  notes: z.string().nullable(),
});

export const lessonStudentSchema = z.object({
  studentId: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  kiteSizeM2: z
    .number()
    .positive('Must be greater than 0')
    .max(30, 'Maximum 30 m²')
    .nullable(),
  board: z.string().trim().max(100),
  notes: z.string().trim(),
  /** Keyed by skill id; skills without an entry were not worked. */
  records: z.record(z.string(), skillRecordValueSchema),
});

export const lessonSchema = z
  .object({
    instructorId: z
      .string({ message: 'Choose an instructor' })
      .min(1, 'Choose an instructor'),
    startsAt: z.date({ message: 'Choose date and time' }),
    durationMinutes: z
      .number({ message: 'Enter the duration' })
      .int()
      .min(1, 'Minimum 1 minute')
      .max(720, 'Maximum 12 hours'),
    spot: z.string().trim().min(2, 'Enter the spot').max(200),
    windDirection: z.enum(WIND_DIRECTIONS).nullable(),
    windMinKnots: knots,
    windMaxKnots: knots,
    notes: z.string().trim(),
    students: z.array(lessonStudentSchema).min(1, 'Add at least one student').max(20),
  })
  .refine(
    ({ windMinKnots, windMaxKnots }) =>
      windMinKnots === null || windMaxKnots === null || windMinKnots <= windMaxKnots,
    { message: 'Must be greater than or equal to the minimum', path: ['windMaxKnots'] },
  );

export type LessonFormValues = z.infer<typeof lessonSchema>;
export type LessonStudentFormValues = z.infer<typeof lessonStudentSchema>;
