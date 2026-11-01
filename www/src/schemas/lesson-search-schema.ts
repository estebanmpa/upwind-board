import { z } from 'zod';

export const newLessonSearchSchema = z.object({
  studentId: z.string().uuid().optional().catch(undefined),
});
