import { z } from 'zod';

export const skillSchema = z.object({
  parentId: z.string().nullable(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9]+(-[A-Z0-9]+)*$/,
      'Use uppercase letters, numbers and hyphens (e.g. L1-WIND)',
    )
    .max(100),
  name: z.string().trim().min(1, 'Enter the name').max(200),
  description: z.string().trim(),
  sortOrder: z.number({ message: 'Enter a number' }).int(),
  active: z.boolean(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;
