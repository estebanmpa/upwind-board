import {
  assertValidSkillSeed,
  flattenSkillSeed,
  loadSkillSeed,
} from './seed-data.js';

describe('flattenSkillSeed', () => {
  it('lists parents before children with default sort orders', () => {
    const flat = flattenSkillSeed([
      {
        code: 'L1',
        name: 'Discovery',
        children: [
          {
            code: 'L1-A',
            name: 'A',
            children: [{ code: 'L1-A-1', name: 'A1' }],
          },
          { code: 'L1-B', name: 'B', sortOrder: 5, description: 'b' },
        ],
      },
      { code: 'L2', name: 'Intermediate' },
    ]);

    expect(flat).toEqual([
      {
        code: 'L1',
        parentCode: null,
        name: 'Discovery',
        description: null,
        sortOrder: 10,
      },
      {
        code: 'L1-A',
        parentCode: 'L1',
        name: 'A',
        description: null,
        sortOrder: 10,
      },
      {
        code: 'L1-A-1',
        parentCode: 'L1-A',
        name: 'A1',
        description: null,
        sortOrder: 10,
      },
      {
        code: 'L1-B',
        parentCode: 'L1',
        name: 'B',
        description: 'b',
        sortOrder: 5,
      },
      {
        code: 'L2',
        parentCode: null,
        name: 'Intermediate',
        description: null,
        sortOrder: 20,
      },
    ]);
  });
});

describe('assertValidSkillSeed', () => {
  it('rejects duplicated and malformed codes', () => {
    const skill = {
      parentCode: null,
      name: 'x',
      description: null,
      sortOrder: 0,
    };
    expect(() =>
      assertValidSkillSeed([
        { ...skill, code: 'A' },
        { ...skill, code: 'A' },
      ]),
    ).toThrow(/Duplicated/);
    expect(() => assertValidSkillSeed([{ ...skill, code: 'a b' }])).toThrow(
      /Invalid skill code/,
    );
  });

  it('accepts the bundled IKO data file', async () => {
    const flat = flattenSkillSeed(await loadSkillSeed());
    expect(() => assertValidSkillSeed(flat)).not.toThrow();
    expect(
      flat.filter((s) => s.parentCode === null).map((s) => s.code),
    ).toEqual(['L1', 'L2', 'L3']);
    expect(flat).toHaveLength(19);
  });
});
