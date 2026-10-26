import { Accordion, Badge, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { ProgressBar } from '@/components/skills/ProgressBar';
import { SkillStatusBadge } from '@/components/skills/SkillStatusBadge';
import type { SkillProgressNode } from '@/types/progress';
import { formatDate } from '@/utils/format';
import { currentLevel } from '@/utils/progress';

function LeafRow({ node }: { node: SkillProgressNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" py={6}>
      <Tooltip label={node.description} disabled={!node.description} multiline maw={320}>
        <div>
          <Text fz="sm" fw={500} c={node.active ? undefined : 'dimmed'}>
            {node.name}
          </Text>
          <Text fz="xs" c="dimmed">
            {node.lastWorkedAt
              ? `Última vez: ${formatDate(node.lastWorkedAt)}`
              : node.code}
          </Text>
        </div>
      </Tooltip>
      <SkillStatusBadge status={node.status} />
    </Group>
  );
}

function ProgressNode({ node }: { node: SkillProgressNode }) {
  if (node.isLeaf) return <LeafRow node={node} />;
  return (
    <Box mt="xs">
      <Group justify="space-between">
        <Text fz="xs" fw={700} tt="uppercase" c="dimmed">
          {node.name}
        </Text>
        <Text fz="xs" c="dimmed">
          {node.summary.mastered}/{node.summary.totalSkills}
        </Text>
      </Group>
      <Box
        pl="md"
        style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}
      >
        {node.children.map((child) => (
          <ProgressNode key={child.id} node={child} />
        ))}
      </Box>
    </Box>
  );
}

export function StudentProgressTree({ tree }: { tree: SkillProgressNode[] }) {
  const current = currentLevel(tree);
  return (
    <Accordion
      multiple
      variant="separated"
      radius="lg"
      defaultValue={current ? [current.id] : []}
    >
      {tree.map((level) => (
        <Accordion.Item key={level.id} value={level.id} className="hover-lift">
          <Accordion.Control>
            <Stack gap={6} pr="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <Text fw={700}>
                    {level.code} · {level.name}
                  </Text>
                  {level.id === current?.id && (
                    <Badge variant="gradient" size="sm">
                      Nivel actual
                    </Badge>
                  )}
                  {level.summary.totalSkills > 0 &&
                    level.summary.mastered === level.summary.totalSkills && (
                      <Badge color="teal" size="sm">
                        Completo
                      </Badge>
                    )}
                </Group>
                <Text fz="sm" c="dimmed">
                  {level.summary.mastered}/{level.summary.totalSkills} dominadas
                </Text>
              </Group>
              <ProgressBar summary={level.summary} size="md" />
            </Stack>
          </Accordion.Control>
          <Accordion.Panel>
            {level.isLeaf ? (
              <LeafRow node={level} />
            ) : (
              level.children.map((child) => <ProgressNode key={child.id} node={child} />)
            )}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
