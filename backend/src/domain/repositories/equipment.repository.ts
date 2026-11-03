import {
  Equipment,
  EquipmentData,
  EquipmentStatus,
  EquipmentType,
} from '../entities/equipment.entity.js';
import { Page, PageRequest } from './pagination.js';

export interface EquipmentFilter {
  /** Case-insensitive match on name, brand, model or serial number. */
  search?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
}

/** An equipment item already used by a lesson in a given time window. */
export interface EquipmentBooking {
  equipmentId: string;
  lessonId: string;
}

export abstract class EquipmentRepository {
  abstract findById(id: string): Promise<Equipment | null>;
  abstract findByIds(ids: string[]): Promise<Equipment[]>;
  abstract findBySerialNumber(serialNumber: string): Promise<Equipment | null>;
  abstract findPage(
    filter: EquipmentFilter,
    request: PageRequest,
  ): Promise<Page<Equipment>>;
  /**
   * Lessons overlapping [from, to) that use any of the given items.
   * @param excludeLessonId the lesson being edited, which never clashes with itself.
   */
  abstract findBookings(
    equipmentIds: string[],
    from: Date,
    to: Date,
    excludeLessonId?: string,
  ): Promise<EquipmentBooking[]>;
  abstract hasLessons(id: string): Promise<boolean>;
  abstract create(data: EquipmentData): Promise<Equipment>;
  abstract update(
    id: string,
    changes: Partial<EquipmentData>,
  ): Promise<Equipment>;
  abstract delete(id: string): Promise<void>;
}
