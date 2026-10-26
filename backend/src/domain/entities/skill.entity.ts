export class Skill {
  id: string;
  /** null for root nodes (IKO levels). */
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Skill) {
    Object.assign(this, props);
  }
}

export type SkillData = Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>;
