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
      title={state?.mode === 'edit' ? 'Editar habilidad' : 'Nueva habilidad'}
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
                label="Depende de"
                description="Vacío para crear un nivel (raíz)"
                placeholder="Nivel raíz"
                data={options}
                searchable
                clearable
                {...field}
              />
            )}
          />
          <Group grow align="start">
            <TextInput
              label="Código"
              {...register('code')}
              error={errors.code?.message}
            />
            <Controller
              control={control}
              name="sortOrder"
              render={({ field }) => (
                <NumberInput
                  label="Orden"
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
          <TextInput label="Nombre" {...register('name')} error={errors.name?.message} />
          <Textarea
            label="Descripción"
            autosize
            minRows={2}
            {...register('description')}
          />
          <Controller
            control={control}
            name="active"
            render={({ field: { value, ...field } }) => (
              <Switch
                label="Activa"
                description="Las inactivas no se pueden registrar en clases nuevas"
                checked={value}
                {...field}
              />
            )}
          />
          <Group justify="end">
            <Button variant="default" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" loading={isSubmitting}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
