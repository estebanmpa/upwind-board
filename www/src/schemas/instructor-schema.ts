import { z } from 'zod';

export const instructorSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresá el nombre').max(100),
  lastName: z.string().trim().min(1, 'Ingresá el apellido').max(100),
  email: z.string().trim().email('Ingresá un email válido').max(255),
  phone: z.string().trim().min(6, 'Ingresá un teléfono').max(50),
  ikoInstructorId: z.string().trim().max(50),
  active: z.boolean(),
});

export type InstructorFormValues = z.infer<typeof instructorSchema>;
