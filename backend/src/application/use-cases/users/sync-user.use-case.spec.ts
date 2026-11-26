import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../domain/entities/user.entity.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import { SyncUserUseCase } from './sync-user.use-case.js';

const existing = new User({
  id: 'user-1',
  iamId: 'iam-1',
  email: 'ana@example.com',
  name: 'Ana',
  createdAt: new Date(),
  updatedAt: new Date(),
});

function setup(found: User | null) {
  const mocks = {
    findByIamId: vi.fn().mockResolvedValue(found),
    create: vi.fn((data: object) => Promise.resolve({ id: 'new', ...data })),
    update: vi.fn((id: string, changes: object) =>
      Promise.resolve(Object.assign(new User(existing), { id }, changes)),
    ),
  };
  return {
    mocks,
    useCase: new SyncUserUseCase(mocks as unknown as UserRepository),
  };
}

describe('SyncUserUseCase', () => {
  it('creates the local user on the first login', async () => {
    const { mocks, useCase } = setup(null);
    const user = await useCase.execute({
      id: 'iam-1',
      email: 'ana@example.com',
      name: 'Ana',
    });
    expect(mocks.create).toHaveBeenCalledWith({
      iamId: 'iam-1',
      email: 'ana@example.com',
      name: 'Ana',
    });
    expect(user.id).toBe('new');
  });

  it('updates the profile when it changed in the IAM', async () => {
    const { mocks, useCase } = setup(existing);
    await useCase.execute({ id: 'iam-1', email: 'ana@new.com', name: 'Ana' });
    expect(mocks.update).toHaveBeenCalledWith('user-1', {
      email: 'ana@new.com',
      name: 'Ana',
    });
  });

  it('leaves an unchanged user alone', async () => {
    const { mocks, useCase } = setup(existing);
    await expect(
      useCase.execute({ id: 'iam-1', email: 'ana@example.com', name: 'Ana' }),
    ).resolves.toBe(existing);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
