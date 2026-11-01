import { CreateSkillUseCase } from './create-skill.use-case.js';
import { DeleteSkillUseCase } from './delete-skill.use-case.js';
import { GetSkillTreeUseCase } from './get-skill-tree.use-case.js';
import { GetSkillUseCase } from './get-skill.use-case.js';
import { ListSkillsUseCase } from './list-skills.use-case.js';
import { SkillHierarchyValidator } from './skill-hierarchy.validator.js';
import { UpdateSkillUseCase } from './update-skill.use-case.js';

export const SKILL_USE_CASES = [
  SkillHierarchyValidator,
  CreateSkillUseCase,
  UpdateSkillUseCase,
  DeleteSkillUseCase,
  GetSkillUseCase,
  ListSkillsUseCase,
  GetSkillTreeUseCase,
];
