import { InMemorySkillRepository } from '../../../../test/fakes/in-memory-skill.repository.js';
import {
  BusinessRuleViolationError,
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { SkillHierarchyValidator } from './skill-hierarchy.validator.js';
import { UpdateSkillUseCase } from './update-skill.use-case.js';

describe('UpdateSkillUseCase', () => {
  let repository: InMemorySkillRepository;
  let useCase: UpdateSkillUseCase;

  // L1 ─┬─ L1-A ── L1-A-1
  //     └─ L1-B
  // L2
  let l1: ReturnType<InMemorySkillRepository['add']>;
  let l1a: typeof l1;
  let l1a1: typeof l1;
  let l1b: typeof l1;
  let l2: typeof l1;

  beforeEach(() => {
    repository = new InMemorySkillRepository();
    useCase = new UpdateSkillUseCase(
      repository,
      new SkillHierarchyValidator(repository),
    );
    l1 = repository.add({ code: 'L1' });
    l1a = repository.add({ code: 'L1-A', parentId: l1.id });
    l1a1 = repository.add({ code: 'L1-A-1', parentId: l1a.id });
    l1b = repository.add({ code: 'L1-B', parentId: l1.id });
    l2 = repository.add({ code: 'L2' });
  });

  describe('cycle prevention', () => {
    it('rejects making a skill its own parent', async () => {
      await expect(
        useCase.execute(l1a.id, { parentId: l1a.id }),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
    });

    it('rejects moving a skill under its direct child', async () => {
      await expect(
        useCase.execute(l1a.id, { parentId: l1a1.id }),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
    });

    it('rejects moving a root under a deep descendant', async () => {
      await expect(
        useCase.execute(l1.id, { parentId: l1a1.id }),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
      expect((await repository.findById(l1.id))?.parentId).toBeNull();
    });

    it('allows moving a skill under a sibling', async () => {
      const updated = await useCase.execute(l1b.id, { parentId: l1a.id });
      expect(updated.parentId).toBe(l1a.id);
    });

    it('allows moving a subtree under another root', async () => {
      const updated = await useCase.execute(l1a.id, { parentId: l2.id });
      expect(updated.parentId).toBe(l2.id);
    });

    it('allows moving a skill to the root with parentId null', async () => {
      const updated = await useCase.execute(l1a1.id, { parentId: null });
      expect(updated.parentId).toBeNull();
    });
  });

  it('rejects a parent that does not exist', async () => {
    await expect(
      useCase.execute(l1b.id, {
        parentId: '00000000-0000-4000-8000-000000000000',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects a parent that already has lesson records', async () => {
    repository.skillIdsWithRecords.add(l1b.id);
    await expect(
      useCase.execute(l1a1.id, { parentId: l1b.id }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects a code used by another skill', async () => {
    await expect(
      useCase.execute(l1b.id, { code: 'L1-A' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('only changes the provided fields', async () => {
    const updated = await useCase.execute(l1b.id, { name: 'Renamed' });
    expect(updated).toMatchObject({
      name: 'Renamed',
      code: 'L1-B',
      parentId: l1.id,
    });
  });

  it('fails with NotFoundError for an unknown skill', async () => {
    await expect(
      useCase.execute('00000000-0000-4000-8000-000000000000', { name: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
