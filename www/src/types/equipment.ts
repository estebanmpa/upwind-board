import type { PageParams } from './api';

export const EQUIPMENT_TYPES = [
  'kite',
  'board',
  'bar',
  'harness',
  'wetsuit',
  'impact_vest',
  'helmet',
  'radio',
  'other',
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  kite: 'Kite',
  board: 'Board',
  bar: 'Bar',
  harness: 'Harness',
  wetsuit: 'Wetsuit',
  impact_vest: 'Impact vest',
  helmet: 'Helmet',
  radio: 'Radio',
  other: 'Other',
};

export const EQUIPMENT_STATUSES = ['available', 'maintenance', 'retired'] as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: 'Available',
  maintenance: 'Maintenance',
  retired: 'Retired',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  available: 'teal',
  maintenance: 'orange',
  retired: 'gray',
};

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string | null;
  model: string | null;
  size: string | null;
  serialNumber: string | null;
  status: EquipmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentInput = Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>;

/** What a lesson embeds about its assigned equipment. */
export type EquipmentSummary = Pick<Equipment, 'id' | 'name' | 'type' | 'size'>;

export interface EquipmentFilters extends PageParams {
  search?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
}
