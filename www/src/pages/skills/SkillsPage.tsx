import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { SkillFormModal, type SkillModalState } from '@/components/skills/SkillFormModal';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useCreateSkill, useDeleteSkill, useUpdateSkill } from '@/mutations/skills';
import { skillTreeQuery } from '@/queries/skills';
import type { SkillInput, SkillTreeNode } from '@/types/skill';
import { collectLeaves } from '@/utils/skill-tree';
import { notifyError, notifySuccess } from '@/utils/notifications';

interface SkillActions {
  onAddChild: (skill: SkillTreeNode) => void;
  onEdit: (skill: SkillTreeNode) => void;
  onDelete: (skill: SkillTreeNode) => void;
}

function SkillActionButtons({
  skill,
  actions,
}: {
  skill: SkillTreeNode;
  actions: SkillActions;
}) {
  return (
    <Group gap={2} wrap="nowrap">
      <Tooltip label="Add sub-skill">
        <ActionIcon
          variant="subtle"
          onClick={() => actions.onAddChild(skill)}
          aria-label="Add sub-skill"
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Edit">
        <ActionIcon
          variant="subtle"
          onClick={() => actions.onEdit(skill)}
          aria-label="Edit"
        >
          <IconEdit size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete">
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => actions.onDelete(skill)}
          aria-label="Delete"
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

function SkillRow({ skill, actions }: { skill: SkillTreeNode; actions: SkillActions }) {
  return (
    <Group justify="space-between" wrap="nowrap" py={6}>
      <Group gap="xs" wrap="nowrap">
        <Badge variant="light" color={skill.isLeaf ? 'teal' : 'brand'} radius="sm">
          {skill.code}
        </Badge>
        <div>
          <Text
            fz="sm"
            fw={skill.isLeaf ? 500 : 700}
            c={skill.active ? undefined : 'dimmed'}
          >
            {skill.name}
          </Text>
          {skill.description && (
            <Text fz="xs" c="dimmed" lineClamp={1}>
              {skill.description}
            </Text>
          )}
        </div>
        {!skill.active && (
          <Badge color="gray" variant="outline" size="xs">
            Inactive
          </Badge>
        )}
      </Group>
      <SkillActionButtons skill={skill} actions={actions} />
    </Group>
  );
}

function SkillBranch({
  skill,
  actions,
}: {
  skill: SkillTreeNode;
  actions: SkillActions;
}) {
  return (
    <Box>
      <SkillRow skill={skill} actions={actions} />
      {skill.children.length > 0 && (
        <Box
          pl="lg"
          style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}
        >
          {skill.children.map((child) => (
            <SkillBranch key={child.id} skill={child} actions={actions} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function LevelCard({ level, actions }: { level: SkillTreeNode; actions: SkillActions }) {
  const leaves = level.isLeaf ? 0 : collectLeaves(level).length;
  return (
    <Card withBorder padding="lg" className="hover-lift fade-in-up">
      <Group justify="space-between" wrap="nowrap" mb="sm">
        <div>
          <Group gap="xs">
            <Title order={4} className="gradient-text">
              {level.code}
            </Title>
            <Title order={4} c={level.active ? undefined : 'dimmed'}>
              {level.name}
            </Title>
            {!level.active && <Badge color="gray">Inactive</Badge>}
          </Group>
          <Text fz="sm" c="dimmed">
            {level.description ?? `${leaves} assessable skills`}
          </Text>
        </div>
        <Group gap="sm" wrap="nowrap">
          <Text fz="sm" c="dimmed" visibleFrom="sm">
            {leaves} assessable
          </Text>
          <SkillActionButtons skill={level} actions={actions} />
        </Group>
      </Group>
      <Box
        pl="lg"
        style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}
      >
        {level.children.map((child) => (
          <SkillBranch key={child.id} skill={child} actions={actions} />
        ))}
      </Box>
    </Card>
  );
}

export function SkillsPage() {
  const [includeInactive, setIncludeInactive] = useState(true);
  const [modal, setModal] = useState<SkillModalState | null>(null);
  const { data: tree = [], isPending } = useQuery(skillTreeQuery(includeInactive));
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const confirmDelete = useConfirmDelete(useDeleteSkill());

  const actions: SkillActions = {
    onAddChild: (parent) => setModal({ mode: 'create', parent }),
    onEdit: (skill) => setModal({ mode: 'edit', skill }),
    onDelete: (skill) =>
      confirmDelete(skill.id, {
        title: 'Delete skill',
        message: `Delete “${skill.name}”? Only possible if it has no sub-skills or lesson records; otherwise, deactivate it.`,
        successMessage: 'Skill deleted',
      }),
  };

  function save(input: SkillInput) {
    const callbacks = {
      onSuccess: () => {
        notifySuccess('Skill saved');
        setModal(null);
      },
      onError: notifyError,
    };
    if (modal?.mode === 'edit') {
      updateSkill.mutate({ id: modal.skill.id, input }, callbacks);
    } else {
      createSkill.mutate(input, callbacks);
    }
  }

  return (
    <>
      <PageHeader
        title="IKO progression"
        description="Levels, skills and sub-skills. Only leaves are assessed in lessons."
        actions={
          <>
            <Switch
              label="Show inactive"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.currentTarget.checked)}
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setModal({ mode: 'create', parent: null })}
            >
              New level
            </Button>
          </>
        }
      />
      {!isPending && tree.length === 0 ? (
        <EmptyState
          title="The tree is empty"
          description="Run the backend migrations or create the first level."
        />
      ) : (
        <Stack>
          {tree.map((level) => (
            <LevelCard key={level.id} level={level} actions={actions} />
          ))}
        </Stack>
      )}
      <SkillFormModal
        state={modal}
        tree={tree}
        isSubmitting={createSkill.isPending || updateSkill.isPending}
        onClose={() => setModal(null)}
        onSubmit={save}
      />
    </>
  );
}
