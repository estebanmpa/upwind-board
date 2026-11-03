import {
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPES,
  type EquipmentSummary,
} from '@/types/equipment';

/** "Rebel 9 #2 · 9 m²" */
export function equipmentLabel(item: Pick<EquipmentSummary, 'name' | 'size'>): string {
  return item.size ? `${item.name} · ${item.size}` : item.name;
}

interface EquipmentOptionGroup {
  group: string;
  items: { value: string; label: string }[];
}

/**
 * Picker options grouped by type. Items already assigned to the lesson stay
 * selectable even if they are no longer available.
 */
export function equipmentOptions(
  available: EquipmentSummary[],
  assigned: EquipmentSummary[] = [],
): EquipmentOptionGroup[] {
  const availableIds = new Set(available.map((item) => item.id));
  const items = [
    ...available.map((item) => ({ item, label: equipmentLabel(item) })),
    ...assigned
      .filter((item) => !availableIds.has(item.id))
      .map((item) => ({ item, label: `${equipmentLabel(item)} (unavailable)` })),
  ];
  return EQUIPMENT_TYPES.map((type) => ({
    group: EQUIPMENT_TYPE_LABELS[type],
    items: items
      .filter(({ item }) => item.type === type)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(({ item, label }) => ({ value: item.id, label })),
  })).filter((group) => group.items.length > 0);
}
