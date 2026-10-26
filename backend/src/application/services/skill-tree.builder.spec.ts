import { Skill } from '../../domain/entities/skill.entity.js';
import { buildSkillTree } from './skill-tree.builder.js';

const skill = (data: Partial<Skill> & { id: string }): Skill =>
  new Skill({
    parentId: null,
    code: data.id.toUpperCase(),
    name: data.id,
    description: null,
    sortOrder: 0,
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...data,
  });

describe('buildSkillTree', () => {
  it('nests children under their parents and flags leaves', () => {
    const tree = buildSkillTree([
      { skill: skill({ id: 'l1' }), hasChildren: true },
      { skill: skill({ id: 'a', parentId: 'l1' }), hasChildren: true },
      { skill: skill({ id: 'a1', parentId: 'a' }), hasChildren: false },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].isLeaf).toBe(false);
    expect(tree[0].children[0].id).toBe('a');
    expect(tree[0].children[0].children[0]).toMatchObject({
      id: 'a1',
      isLeaf: true,
      children: [],
    });
  });

  it('orders siblings by sortOrder at every depth, then by name', () => {
    const tree = buildSkillTree([
      { skill: skill({ id: 'l2', sortOrder: 2 }), hasChildren: false },
      { skill: skill({ id: 'l1', sortOrder: 1 }), hasChildren: true },
      {
        skill: skill({ id: 'z', parentId: 'l1', sortOrder: 1 }),
        hasChildren: false,
      },
      {
        skill: skill({ id: 'b', parentId: 'l1', sortOrder: 5 }),
        hasChildren: false,
      },
      {
        skill: skill({ id: 'a', parentId: 'l1', sortOrder: 1 }),
        hasChildren: false,
      },
    ]);

    expect(tree.map((n) => n.id)).toEqual(['l1', 'l2']);
    expect(tree[0].children.map((n) => n.id)).toEqual(['a', 'z', 'b']);
  });

  it('keeps isLeaf false when a node only has filtered-out children', () => {
    const tree = buildSkillTree([
      { skill: skill({ id: 'l1' }), hasChildren: true },
    ]);
    expect(tree[0]).toMatchObject({ isLeaf: false, children: [] });
  });

  it('drops nodes whose parent is not in the input', () => {
    const tree = buildSkillTree([
      { skill: skill({ id: 'l1' }), hasChildren: false },
      {
        skill: skill({ id: 'orphan', parentId: 'missing' }),
        hasChildren: false,
      },
    ]);
    expect(tree.map((n) => n.id)).toEqual(['l1']);
  });
});
