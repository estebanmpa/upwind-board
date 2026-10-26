import { InMemorySkillRepository } from '../../../../test/fakes/in-memory-skill.repository.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { CreateSkillUseCase } from './create-skill.use-case.js';
import { SkillHierarchyValidator } from './skill-hierarchy.validator.js';

describe('CreateSkillUseCase', () => {
  let repository: InMemorySkillRepository;
  let useCase: CreateSkillUseCase;

  beforeEach(() => {
    repository = new InMemorySkillRepository();
    useCase = new CreateSkillUseCase(
      repository,
      new SkillHierarchyValidator(repository),
    );
  });

  it('creates a root skill with defaults', async () => {
    const skill = await useCase.execute({ code: 'L1', name: 'Discovery' });
    expect(skill).toMatchObject({
      parentId: null,
      sortOrder: 0,
      active: true,
      description: null,
    });
  });

  it('creates a child skill', async () => {
    const root = repository.add({ code: 'L1' });
    const skill = await useCase.execute({
      code: 'L1-X',
      name: 'X',
      parentId: root.id,
    });
    expect(skill.parentId).toBe(root.id);
  });

  it('rejects a duplicated code', async () => {
    repository.add({ code: 'L1' });
    await expect(
      useCase.execute({ code: 'L1', name: 'Again' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects an unknown parent', async () => {
    await expect(
      useCase.execute({
        code: 'L1-X',
        name: 'X',
        parentId: '00000000-0000-4000-8000-000000000000',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects adding children to an already evaluated leaf', async () => {
    const leaf = repository.add({ code: 'L1-A' });
    repository.skillIdsWithRecords.add(leaf.id);
    await expect(
      useCase.execute({ code: 'L1-A-1', name: 'Sub', parentId: leaf.id }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
