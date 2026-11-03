import type { Page } from '@/types/api';
import type { Equipment, EquipmentFilters, EquipmentInput } from '@/types/equipment';
import { request } from './http';

export const fetchEquipmentPage = (filters: EquipmentFilters = {}) =>
  request<Page<Equipment>>('/equipment', { query: filters });

export const fetchEquipment = (id: string) => request<Equipment>(`/equipment/${id}`);

export const createEquipment = (input: EquipmentInput) =>
  request<Equipment>('/equipment', { method: 'POST', body: input });

export const updateEquipment = (id: string, input: EquipmentInput) =>
  request<Equipment>(`/equipment/${id}`, { method: 'PATCH', body: input });

export const deleteEquipment = (id: string) =>
  request<void>(`/equipment/${id}`, { method: 'DELETE' });
