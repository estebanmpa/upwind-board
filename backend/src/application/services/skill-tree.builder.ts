import { SkillTreeEntry } from '../../domain/repositories/skill.repository.js';
import { SkillTreeNodeDto } from '../dtos/skills/skill-tree-node.dto.js';

const bySortOrder = (a: SkillTreeNodeDto, b: SkillTreeNodeDto) =>
  a.sortOrder - b.sortOrder ||
  a.name.localeCompare(b.name) ||
  a.code.localeCompare(b.code);

/**
 * Nests the flat result of the recursive query. Siblings are ordered by
 * sort_order (then name/code to keep the output deterministic). Entries whose
 * parent is not part of the input are dropped.
 */
export function buildSkillTree(entries: SkillTreeEntry[]): SkillTreeNodeDto[] {
  const nodes = new Map<string, SkillTreeNodeDto>();
  for (const { skill, hasChildren } of entries) {
    nodes.set(skill.id, {
      id: skill.id,
      parentId: skill.parentId,
      code: skill.code,
      name: skill.name,
      description: skill.description,
      sortOrder: skill.sortOrder,
      active: skill.active,
      isLeaf: !hasChildren,
      children: [],
    });
  }

  const roots: SkillTreeNodeDto[] = [];
  for (const node of nodes.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      nodes.get(node.parentId)?.children.push(node);
    }
  }

  const sortRecursively = (list: SkillTreeNodeDto[]) => {
    list.sort(bySortOrder);
    list.forEach((node) => sortRecursively(node.children));
  };
  sortRecursively(roots);
  return roots;
}
