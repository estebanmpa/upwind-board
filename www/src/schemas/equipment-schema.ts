import { z } from 'zod';
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from '@/types/equipment';

export const equipmentSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(100),
  type: z.enum(EQUIPMENT_TYPES, { message: 'Choose a type' }),
  brand: z.string().trim().max(100),
  model: z.string().trim().max(100),
  size: z.string().trim().max(50),
  serialNumber: z.string().trim().max(100),
  status: z.enum(EQUIPMENT_STATUSES),
  notes: z.string().trim(),
});

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
