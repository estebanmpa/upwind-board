import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter the first name').max(100),
  lastName: z.string().trim().min(1, 'Enter the last name').max(100),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  phone: z.string().trim().min(6, 'Enter a phone number').max(50),
  birthDate: z.date().max(new Date(), 'The date cannot be in the future').nullable(),
  weightKg: z
    .number()
    .positive('Must be greater than 0')
    .max(250, 'Check the weight')
    .nullable(),
  emergencyContactName: z.string().trim().min(1, 'Enter a contact').max(200),
  emergencyContactPhone: z.string().trim().min(6, 'Enter a phone number').max(50),
  notes: z.string().trim(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
