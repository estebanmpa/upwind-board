import { z } from 'zod';

export const skillSchema = z.object({
  parentId: z.string().nullable(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, 'Usá mayúsculas, números y guiones (ej. L1-WIND)')
    .max(100),
  name: z.string().trim().min(1, 'Ingresá el nombre').max(200),
  description: z.string().trim(),
  sortOrder: z.number({ message: 'Ingresá un número' }).int(),
  active: z.boolean(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;
