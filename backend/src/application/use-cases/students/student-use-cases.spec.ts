import type { Mocked } from 'vitest';
import { studentFixture } from '../../../../test/fakes/fixtures.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { CreateStudentUseCase } from './create-student.use-case.js';
import { DeleteStudentUseCase } from './delete-student.use-case.js';
import { GetStudentUseCase } from './get-student.use-case.js';
import { UpdateStudentUseCase } from './update-student.use-case.js';

const createRepository = (): Mocked<StudentRepository> => ({
  findById: vi.fn(),
  findByIds: vi.fn(),
  findPage: vi.fn(),
  hasLessons: vi.fn(),
  create: vi.fn(async (data) => studentFixture(data)),
  update: vi.fn(async (_id, changes) => studentFixture(changes)),
  delete: vi.fn(),
});

describe('Student use cases', () => {
  let repository: Mocked<StudentRepository>;

  beforeEach(() => {
    repository = createRepository();
  });

  it('creates a student filling optional fields with null', async () => {
    await new CreateStudentUseCase(repository).execute({
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '1',
      emergencyContactName: 'María',
      emergencyContactPhone: '2',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: null,
        birthDate: null,
        weightKg: null,
        notes: null,
      }),
    );
  });

  it('fails with NotFoundError for an unknown student', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      new GetStudentUseCase(repository).execute('x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      new UpdateStudentUseCase(repository).execute('x', { notes: 'n' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows clearing nullable fields on update', async () => {
    repository.findById.mockResolvedValue(studentFixture({ weightKg: 70 }));
    await new UpdateStudentUseCase(repository).execute(studentFixture().id, {
      weightKg: null,
    });
    expect(repository.update).toHaveBeenCalledWith(
      studentFixture().id,
      expect.objectContaining({ weightKg: null, firstName: undefined }),
    );
  });

  it('rejects deleting a student with lessons', async () => {
    repository.findById.mockResolvedValue(studentFixture());
    repository.hasLessons.mockResolvedValue(true);
    await expect(
      new DeleteStudentUseCase(repository).execute(studentFixture().id),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
