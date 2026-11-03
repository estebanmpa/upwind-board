import { ConflictError } from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';

/** Serial numbers are optional but must be unique when provided. */
export async function assertSerialNumberIsFree(
  equipment: EquipmentRepository,
  serialNumber: string | null | undefined,
  ownId?: string,
): Promise<void> {
  if (!serialNumber) return;
  const existing = await equipment.findBySerialNumber(serialNumber);
  if (existing && existing.id !== ownId) {
    throw new ConflictError(
      `Equipment with serial number "${serialNumber}" already exists`,
    );
  }
}
