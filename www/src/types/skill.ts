export const SKILL_STATUSES = ['introduced', 'practiced', 'mastered'] as const;

export type SkillStatus = (typeof SKILL_STATUSES)[number];

export const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  introduced: 'Introducido',
  practiced: 'Practicado',
  mastered: 'Dominado',
};

export const SKILL_STATUS_COLORS: Record<SkillStatus, string> = {
  introduced: 'brand',
  practiced: 'orange',
  mastered: 'teal',
};

export const NOT_STARTED_LABEL = 'Sin trabajar';

export interface Skill {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SkillInput = Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>;

export interface SkillTreeNode {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  isLeaf: boolean;
  children: SkillTreeNode[];
}
