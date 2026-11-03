import { useMutation } from '@tanstack/react-query';
import { createEquipment, deleteEquipment, updateEquipment } from '@/api/equipment-api';
import { queryKeys } from '@/queries/query-keys';
import type { EquipmentInput } from '@/types/equipment';
import { useInvalidate } from './invalidate';

export function useCreateEquipment() {
  const invalidate = useInvalidate(queryKeys.equipment.all);
  return useMutation({
    mutationFn: (input: EquipmentInput) => createEquipment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateEquipment() {
  // Lessons embed the equipment's name and size.
  const invalidate = useInvalidate(queryKeys.equipment.all, queryKeys.lessons.all);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EquipmentInput }) =>
      updateEquipment(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteEquipment() {
  const invalidate = useInvalidate(queryKeys.equipment.all);
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: invalidate,
  });
}
