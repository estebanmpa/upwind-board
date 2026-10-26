import { z } from 'zod';
import { SKILL_STATUSES } from '@/types/skill';
import { WIND_DIRECTIONS } from '@/types/wind';

const knots = z.number().int().min(0, 'Mínimo 0').max(99, 'Máximo 99').nullable();

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
    .positive('Debe ser mayor a 0')
    .max(30, 'Máximo 30 m²')
    .nullable(),
  board: z.string().trim().max(100),
  notes: z.string().trim(),
  /** Keyed by skill id; skills without an entry were not worked. */
  records: z.record(z.string(), skillRecordValueSchema),
});

export const lessonSchema = z
  .object({
    instructorId: z
      .string({ message: 'Elegí un instructor' })
      .min(1, 'Elegí un instructor'),
    startsAt: z.date({ message: 'Elegí fecha y hora' }),
    durationMinutes: z
      .number({ message: 'Ingresá la duración' })
      .int()
      .min(1, 'Mínimo 1 minuto')
      .max(720, 'Máximo 12 horas'),
    spot: z.string().trim().min(2, 'Ingresá el spot').max(200),
    windDirection: z.enum(WIND_DIRECTIONS).nullable(),
    windMinKnots: knots,
    windMaxKnots: knots,
    notes: z.string().trim(),
    students: z.array(lessonStudentSchema).min(1, 'Agregá al menos un alumno').max(20),
  })
  .refine(
    ({ windMinKnots, windMaxKnots }) =>
      windMinKnots === null || windMaxKnots === null || windMinKnots <= windMaxKnots,
    { message: 'Debe ser mayor o igual al mínimo', path: ['windMaxKnots'] },
  );

export type LessonFormValues = z.infer<typeof lessonSchema>;
export type LessonStudentFormValues = z.infer<typeof lessonStudentSchema>;
