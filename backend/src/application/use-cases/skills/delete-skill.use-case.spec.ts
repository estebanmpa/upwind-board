import { InMemorySkillRepository } from '../../../../test/fakes/in-memory-skill.repository.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { DeleteSkillUseCase } from './delete-skill.use-case.js';

describe('DeleteSkillUseCase', () => {
  let repository: InMemorySkillRepository;
  let useCase: DeleteSkillUseCase;

  beforeEach(() => {
    repository = new InMemorySkillRepository();
    useCase = new DeleteSkillUseCase(repository);
  });

  it('deletes an unused leaf', async () => {
    const leaf = repository.add({ code: 'L1' });
    await useCase.execute(leaf.id);
    expect(await repository.findById(leaf.id)).toBeNull();
  });

  it('rejects deleting a skill with children', async () => {
    const root = repository.add({ code: 'L1' });
    repository.add({ code: 'L1-A', parentId: root.id });
    await expect(useCase.execute(root.id)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('rejects deleting a skill with lesson records', async () => {
    const leaf = repository.add({ code: 'L1' });
    repository.skillIdsWithRecords.add(leaf.id);
    await expect(useCase.execute(leaf.id)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('fails with NotFoundError for an unknown skill', async () => {
    await expect(
      useCase.execute('00000000-0000-4000-8000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
