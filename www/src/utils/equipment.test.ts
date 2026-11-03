import { describe, expect, it } from 'vitest';
import type { EquipmentSummary } from '@/types/equipment';
import { equipmentLabel, equipmentOptions } from './equipment';

const kite: EquipmentSummary = { id: 'k1', name: 'Rebel #1', type: 'kite', size: '9 m²' };
const board: EquipmentSummary = { id: 'b1', name: 'Twin tip', type: 'board', size: null };

describe('equipmentLabel', () => {
  it('appends the size when there is one', () => {
    expect(equipmentLabel(kite)).toBe('Rebel #1 · 9 m²');
    expect(equipmentLabel(board)).toBe('Twin tip');
  });
});

describe('equipmentOptions', () => {
  it('groups available items by type, in type order', () => {
    expect(equipmentOptions([board, kite])).toEqual([
      { group: 'Kite', items: [{ value: 'k1', label: 'Rebel #1 · 9 m²' }] },
      { group: 'Board', items: [{ value: 'b1', label: 'Twin tip' }] },
    ]);
  });

  it('keeps assigned items that are no longer available, flagged', () => {
    const retired: EquipmentSummary = { id: 'k2', name: 'Old', type: 'kite', size: null };
    expect(equipmentOptions([kite], [kite, retired])).toEqual([
      {
        group: 'Kite',
        items: [
          { value: 'k2', label: 'Old (unavailable)' },
          { value: 'k1', label: 'Rebel #1 · 9 m²' },
        ],
      },
    ]);
  });
});
