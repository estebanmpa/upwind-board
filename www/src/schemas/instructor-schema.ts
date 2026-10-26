import { z } from 'zod';

export const instructorSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter the first name').max(100),
  lastName: z.string().trim().min(1, 'Enter the last name').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  phone: z.string().trim().min(6, 'Enter a phone number').max(50),
  ikoInstructorId: z.string().trim().max(50),
  active: z.boolean(),
});

export type InstructorFormValues = z.infer<typeof instructorSchema>;
