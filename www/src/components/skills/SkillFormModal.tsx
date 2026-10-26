import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { skillSchema, type SkillFormValues } from '@/schemas/skill-schema';
import type { SkillInput, SkillTreeNode } from '@/types/skill';
import { emptyToNull } from '@/utils/form';
import { parentOptions } from '@/utils/skill-tree';

export type SkillModalState =
  | { mode: 'create'; parent: SkillTreeNode | null }
  | { mode: 'edit'; skill: SkillTreeNode };

interface SkillFormModalProps {
  state: SkillModalState | null;
  tree: SkillTreeNode[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: SkillInput) => void;
}

function toFormValues(state: SkillModalState): SkillFormValues {
  if (state.mode === 'edit') {
    const { skill } = state;
    return {
      parentId: skill.parentId,
      code: skill.code,
      name: skill.name,
      description: skill.description ?? '',
      sortOrder: skill.sortOrder,
      active: skill.active,
    };
  }
  const siblings = state.parent?.children ?? [];
  return {
    parentId: state.parent?.id ?? null,
    code: state.parent ? `${state.parent.code}-` : '',
    name: '',
    description: '',
    sortOrder: (Math.max(0, ...siblings.map((sibling) => sibling.sortOrder)) || 0) + 10,
    active: true,
  };
}

export function SkillFormModal({
  state,
  tree,
  isSubmitting,
  onClose,
  onSubmit,
}: SkillFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormValues>({ resolver: zodResolver(skillSchema) });

  useEffect(() => {
    if (state) reset(toFormValues(state));
  }, [state, reset]);

  const options = parentOptions(tree, state?.mode === 'edit' ? state.skill : undefined);
  const submit = (values: SkillFormValues) =>
    onSubmit({ ...values, description: emptyToNull(values.description) });

  return (
    <Modal
      opened={state !== null}
      onClose={onClose}
      title={state?.mode === 'edit' ? 'Edit skill' : 'New skill'}
      size="lg"
      radius="lg"
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <Stack>
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <Select
                label="Parent"
                description="Leave empty to create a level (root)"
                placeholder="Root level"
                data={options}
                searchable
                clearable
                {...field}
              />
            )}
          />
          <Group grow align="start">
            <TextInput label="Code" {...register('code')} error={errors.code?.message} />
            <Controller
              control={control}
              name="sortOrder"
              render={({ field }) => (
                <NumberInput
                  label="Sort order"
                  allowDecimal={false}
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(value === '' ? undefined : Number(value))
                  }
                  error={errors.sortOrder?.message}
                />
              )}
            />
          </Group>
          <TextInput label="Name" {...register('name')} error={errors.name?.message} />
          <Textarea
            label="Description"
            autosize
            minRows={2}
            {...register('description')}
          />
          <Controller
            control={control}
            name="active"
            render={({ field: { value, ...field } }) => (
              <Switch
                label="Active"
                description="Inactive skills cannot be recorded in new lessons"
                checked={value}
                {...field}
              />
            )}
          />
          <Group justify="end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={isSubmitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
