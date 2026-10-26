import type { Mocked } from 'vitest';
import { instructorFixture } from '../../../../test/fakes/fixtures.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { InstructorRepository } from '../../../domain/repositories/instructor.repository.js';
import { CreateInstructorUseCase } from './create-instructor.use-case.js';
import { DeleteInstructorUseCase } from './delete-instructor.use-case.js';
import { UpdateInstructorUseCase } from './update-instructor.use-case.js';

const createRepository = (): Mocked<InstructorRepository> => ({
  findById: vi.fn(),
  findByIds: vi.fn(),
  findByEmail: vi.fn(),
  findPage: vi.fn(),
  hasLessons: vi.fn(),
  create: vi.fn(async (data) => instructorFixture(data)),
  update: vi.fn(async (_id, changes) => instructorFixture(changes)),
  delete: vi.fn(),
});

const dto = {
  firstName: 'Ana',
  lastName: 'Ríos',
  email: 'ana@example.com',
  phone: '123',
};

describe('Instructor use cases', () => {
  let repository: Mocked<InstructorRepository>;

  beforeEach(() => {
    repository = createRepository();
  });

  describe('CreateInstructorUseCase', () => {
    it('creates an active instructor by default', async () => {
      repository.findByEmail.mockResolvedValue(null);
      await new CreateInstructorUseCase(repository).execute(dto);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        ikoInstructorId: null,
        active: true,
      });
    });

    it('rejects a duplicated email', async () => {
      repository.findByEmail.mockResolvedValue(instructorFixture());
      await expect(
        new CreateInstructorUseCase(repository).execute(dto),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('UpdateInstructorUseCase', () => {
    it('rejects an email used by another instructor', async () => {
      repository.findById.mockResolvedValue(instructorFixture());
      repository.findByEmail.mockResolvedValue(
        instructorFixture({ id: '33333333-3333-4333-8333-333333333333' }),
      );
      await expect(
        new UpdateInstructorUseCase(repository).execute(
          instructorFixture().id,
          { email: 'other@example.com' },
        ),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('fails with NotFoundError for an unknown instructor', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        new UpdateInstructorUseCase(repository).execute('x', { phone: '1' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('DeleteInstructorUseCase', () => {
    it('rejects deleting an instructor with lessons', async () => {
      repository.findById.mockResolvedValue(instructorFixture());
      repository.hasLessons.mockResolvedValue(true);
      await expect(
        new DeleteInstructorUseCase(repository).execute(instructorFixture().id),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('deletes an instructor without lessons', async () => {
      repository.findById.mockResolvedValue(instructorFixture());
      repository.hasLessons.mockResolvedValue(false);
      await new DeleteInstructorUseCase(repository).execute(
        instructorFixture().id,
      );
      expect(repository.delete).toHaveBeenCalledWith(instructorFixture().id);
    });
  });
});
