import {
  Accordion,
  Badge,
  Box,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import type { LessonStudentFormValues } from '@/schemas/lesson-schema';
import {
  SKILL_STATUS_COLORS,
  SKILL_STATUS_LABELS,
  SKILL_STATUSES,
  type SkillStatus,
  type SkillTreeNode,
} from '@/types/skill';
import { collectLeaves } from '@/utils/skill-tree';

type Records = LessonStudentFormValues['records'];

interface SkillRecordsEditorProps {
  tree: SkillTreeNode[];
  value: Records;
  onChange: (records: Records) => void;
  /** Student's current status per skill, shown as a hint. */
  currentStatuses?: Map<string, SkillStatus>;
}

const NOT_WORKED = 'none';

const STATUS_OPTIONS = [
  { value: NOT_WORKED, label: '—' },
  ...SKILL_STATUSES.map((status) => ({
    value: status,
    label: SKILL_STATUS_LABELS[status],
  })),
];

/** Inactive skills are only listed when this lesson already recorded them. */
function isVisible(node: SkillTreeNode, value: Records): boolean {
  if (node.isLeaf) return node.active || node.id in value;
  return (
    (node.active || node.children.some((child) => isVisible(child, value))) &&
    node.children.some((child) => isVisible(child, value))
  );
}

function setStatus(value: Records, skillId: string, status: string): Records {
  const { [skillId]: current, ...rest } = value;
  if (status === NOT_WORKED) return rest;
  return {
    ...rest,
    [skillId]: { status: status as SkillStatus, notes: current?.notes ?? null },
  };
}

interface NodeProps extends Omit<SkillRecordsEditorProps, 'tree'> {
  node: SkillTreeNode;
}

function SkillLeafRow({ node, value, onChange, currentStatuses }: NodeProps) {
  const selected = value[node.id]?.status;
  const current = currentStatuses?.get(node.id);
  return (
    <Group justify="space-between" wrap="wrap" gap="xs" py={4}>
      <div>
        <Text fz="sm" fw={500}>
          {node.name}
        </Text>
        <Text fz="xs" c="dimmed">
          {current ? `Last recorded: ${SKILL_STATUS_LABELS[current]}` : 'Never worked on'}
        </Text>
      </div>
      <SegmentedControl
        size="xs"
        radius="xl"
        data={STATUS_OPTIONS}
        value={selected ?? NOT_WORKED}
        color={selected ? SKILL_STATUS_COLORS[selected] : 'gray'}
        onChange={(status) => onChange(setStatus(value, node.id, status))}
        aria-label={node.name}
      />
    </Group>
  );
}

function SkillNode(props: NodeProps) {
  const { node, value } = props;
  if (!isVisible(node, value)) return null;
  if (node.isLeaf) return <SkillLeafRow {...props} />;
  return (
    <Box>
      <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mt="xs">
        {node.name}
      </Text>
      <Box
        pl="md"
        style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}
      >
        {node.children.map((child) => (
          <SkillNode key={child.id} {...props} node={child} />
        ))}
      </Box>
    </Box>
  );
}

export function SkillRecordsEditor({ tree, ...props }: SkillRecordsEditorProps) {
  const levels = tree.filter((level) => isVisible(level, props.value));
  return (
    <Accordion multiple variant="separated" radius="md">
      {levels.map((level) => {
        const worked = collectLeaves(level).filter(
          (leaf) => leaf.id in props.value,
        ).length;
        return (
          <Accordion.Item key={level.id} value={level.id}>
            <Accordion.Control>
              <Group justify="space-between" pr="sm">
                <Text fw={600}>
                  {level.code} · {level.name}
                </Text>
                {worked > 0 && (
                  <Badge variant="gradient" size="sm">
                    {worked} {worked === 1 ? 'skill' : 'skills'}
                  </Badge>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={0}>
                {level.isLeaf ? (
                  <SkillLeafRow {...props} node={level} />
                ) : (
                  level.children.map((child) => (
                    <SkillNode key={child.id} {...props} node={child} />
                  ))
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
