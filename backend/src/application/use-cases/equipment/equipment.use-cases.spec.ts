import { describe, expect, it, vi } from 'vitest';
import {
  EquipmentStatus,
  EquipmentType,
} from '../../../domain/entities/equipment.entity.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { EquipmentRepository } from '../../../domain/repositories/equipment.repository.js';
import { CreateEquipmentUseCase } from './create-equipment.use-case.js';
import { DeleteEquipmentUseCase } from './delete-equipment.use-case.js';
import { UpdateEquipmentUseCase } from './update-equipment.use-case.js';

function fakeRepository(overrides: Record<string, unknown> = {}) {
  const mocks = {
    findById: vi.fn().mockResolvedValue({ id: 'kite-1' }),
    findBySerialNumber: vi.fn().mockResolvedValue(null),
    hasLessons: vi.fn().mockResolvedValue(false),
    create: vi.fn((data: object) => Promise.resolve({ id: 'new', ...data })),
    update: vi.fn((id: string, changes: object) =>
      Promise.resolve({ id, ...changes }),
    ),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return { mocks, repository: mocks as unknown as EquipmentRepository };
}

describe('CreateEquipmentUseCase', () => {
  it('defaults status to available and empty fields to null', async () => {
    const { mocks, repository } = fakeRepository();
    await new CreateEquipmentUseCase(repository).execute({
      name: 'Rebel 9',
      type: EquipmentType.Kite,
      brand: '',
    });
    expect(mocks.create).toHaveBeenCalledWith({
      name: 'Rebel 9',
      type: EquipmentType.Kite,
      brand: null,
      model: null,
      size: null,
      serialNumber: null,
      status: EquipmentStatus.Available,
      notes: null,
    });
  });

  it('rejects a duplicated serial number', async () => {
    const { repository } = fakeRepository({
      findBySerialNumber: vi.fn().mockResolvedValue({ id: 'other' }),
    });
    await expect(
      new CreateEquipmentUseCase(repository).execute({
        name: 'Rebel 9',
        type: EquipmentType.Kite,
        serialNumber: 'SN-1',
      }),
    ).rejects.toThrow(ConflictError);
  });
});

describe('UpdateEquipmentUseCase', () => {
  it('allows keeping its own serial number', async () => {
    const { mocks, repository } = fakeRepository({
      findBySerialNumber: vi.fn().mockResolvedValue({ id: 'kite-1' }),
    });
    await new UpdateEquipmentUseCase(repository).execute('kite-1', {
      serialNumber: 'SN-1',
    });
    expect(mocks.update).toHaveBeenCalled();
  });

  it('only touches the fields that were sent', async () => {
    const { mocks, repository } = fakeRepository();
    await new UpdateEquipmentUseCase(repository).execute('kite-1', {
      status: EquipmentStatus.Maintenance,
      size: '',
    });
    expect(mocks.update).toHaveBeenCalledWith(
      'kite-1',
      expect.objectContaining({
        status: EquipmentStatus.Maintenance,
        size: null,
        brand: undefined,
        name: undefined,
      }),
    );
  });
});

describe('DeleteEquipmentUseCase', () => {
  it('fails for unknown equipment', async () => {
    const { repository } = fakeRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    await expect(
      new DeleteEquipmentUseCase(repository).execute('ghost'),
    ).rejects.toThrow(NotFoundError);
  });

  it('refuses to delete equipment used in lessons', async () => {
    const { mocks, repository } = fakeRepository({
      hasLessons: vi.fn().mockResolvedValue(true),
    });
    await expect(
      new DeleteEquipmentUseCase(repository).execute('kite-1'),
    ).rejects.toThrow(ConflictError);
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it('deletes unused equipment', async () => {
    const { mocks, repository } = fakeRepository();
    await new DeleteEquipmentUseCase(repository).execute('kite-1');
    expect(mocks.delete).toHaveBeenCalledWith('kite-1');
  });
});
