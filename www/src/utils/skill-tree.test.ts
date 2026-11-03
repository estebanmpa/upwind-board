import { describe, expect, it } from 'vitest';
import type { SkillTreeNode } from '@/types/skill';
import { recordsInTreeOrder } from './skill-tree';

const node = (id: string, children: SkillTreeNode[] = []): SkillTreeNode => ({
  id,
  parentId: null,
  code: id.toUpperCase(),
  name: id,
  description: null,
  sortOrder: 0,
  active: true,
  isLeaf: children.length === 0,
  children,
});

const tree = [node('level-1', [node('a'), node('b')]), node('level-2', [node('c')])];

describe('recordsInTreeOrder', () => {
  it('sorts records by their position in the tree', () => {
    const result = recordsInTreeOrder(
      [{ skillId: 'c' }, { skillId: 'a' }, { skillId: 'b' }],
      tree,
    );
    expect(result.map(({ skill }) => skill?.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps records of unknown skills at the end', () => {
    const result = recordsInTreeOrder([{ skillId: 'ghost' }, { skillId: 'a' }], tree);
    expect(result.map(({ record, skill }) => [record.skillId, skill?.id])).toEqual([
      ['a', 'a'],
      ['ghost', undefined],
    ]);
  });
});
