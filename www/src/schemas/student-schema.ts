import { z } from 'zod';

const optionalPhone = z.union([
  z.literal(''),
  z.string().trim().min(6, 'Enter a valid phone number').max(50),
]);

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter the first name').max(100),
  lastName: z.string().trim().min(1, 'Enter the last name').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  phone: optionalPhone,
  birthDate: z.date().max(new Date(), 'The date cannot be in the future').nullable(),
  weightKg: z
    .number()
    .positive('Must be greater than 0')
    .max(250, 'Check the weight')
    .nullable(),
  emergencyContactName: z.string().trim().max(200),
  emergencyContactPhone: optionalPhone,
  notes: z.string().trim(),
});

/** The minimum to create a student, e.g. while scheduling a lesson. */
export const quickStudentSchema = studentSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

export type StudentFormValues = z.infer<typeof studentSchema>;
export type QuickStudentFormValues = z.infer<typeof quickStudentSchema>;
