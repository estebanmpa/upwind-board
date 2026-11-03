import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { fetchEquipmentPage } from '@/api/equipment-api';
import type { EquipmentFilters } from '@/types/equipment';
import { queryKeys } from './query-keys';

export const equipmentListQuery = (filters: EquipmentFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.equipment.list(filters),
    queryFn: () => fetchEquipmentPage(filters),
    placeholderData: keepPreviousData,
  });

/** Options for the lesson equipment picker (the API caps pages at 100). */
export const availableEquipmentQuery = () =>
  equipmentListQuery({ status: 'available', limit: 100 });
