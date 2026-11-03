import type { SkillTreeNode } from '@/types/skill';

interface TreeLike<T> {
  id: string;
  children: T[];
}

/** Depth-first (pre-order) list of every node with its depth. */
export function flattenTree<T extends TreeLike<T>>(
  nodes: T[],
  depth = 0,
): { node: T; depth: number }[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flattenTree(node.children, depth + 1),
  ]);
}

/** Ids of the node and everything below it. */
function subtreeIds<T extends TreeLike<T>>(node: T): Set<string> {
  return new Set(flattenTree([node]).map(({ node: current }) => current.id));
}

export function collectLeaves(node: SkillTreeNode): SkillTreeNode[] {
  return node.isLeaf ? [node] : node.children.flatMap(collectLeaves);
}

/**
 * Options for a "parent skill" picker: skills that have lesson records can't
 * be detected client-side, but the moved skill and its descendants can.
 */
export function parentOptions(
  tree: SkillTreeNode[],
  excludedSubtreeOf?: SkillTreeNode,
): { value: string; label: string }[] {
  const excluded = excludedSubtreeOf ? subtreeIds(excludedSubtreeOf) : new Set();
  return flattenTree(tree)
    .filter(({ node }) => !excluded.has(node.id))
    .map(({ node, depth }) => ({
      value: node.id,
      label: `${'· '.repeat(depth)}${node.code} — ${node.name}`,
    }));
}

/**
 * Pairs each record with its skill, in the order the skill tree shows them.
 * Records whose skill is not in the tree go last with `skill: undefined`.
 */
export function recordsInTreeOrder<T extends { skillId: string }>(
  records: T[],
  tree: SkillTreeNode[],
): { record: T; skill: SkillTreeNode | undefined }[] {
  const position = new Map(
    flattenTree(tree).map(({ node }, index) => [node.id, { node, index }]),
  );
  return records
    .map((record) => ({ record, entry: position.get(record.skillId) }))
    .sort((a, b) => (a.entry?.index ?? Infinity) - (b.entry?.index ?? Infinity))
    .map(({ record, entry }) => ({ record, skill: entry?.node }));
}
