import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresá el nombre').max(100),
  lastName: z.string().trim().min(1, 'Ingresá el apellido').max(100),
  email: z.union([z.literal(''), z.string().trim().email('Ingresá un email válido')]),
  phone: z.string().trim().min(6, 'Ingresá un teléfono').max(50),
  birthDate: z.date().max(new Date(), 'La fecha no puede ser futura').nullable(),
  weightKg: z
    .number()
    .positive('Debe ser mayor a 0')
    .max(250, 'Revisá el peso')
    .nullable(),
  emergencyContactName: z.string().trim().min(1, 'Ingresá un contacto').max(200),
  emergencyContactPhone: z.string().trim().min(6, 'Ingresá un teléfono').max(50),
  notes: z.string().trim(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
