import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { equipmentSchema, type EquipmentFormValues } from '@/schemas/equipment-schema';
import {
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPES,
  type Equipment,
  type EquipmentInput,
} from '@/types/equipment';
import { emptyToNull } from '@/utils/form';

/** `null` closes the modal; `{}` creates a new item. */
export type EquipmentModalState = { equipment?: Equipment } | null;

interface EquipmentFormModalProps {
  state: EquipmentModalState;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: EquipmentInput) => void;
}

const TYPE_OPTIONS = EQUIPMENT_TYPES.map((type) => ({
  value: type,
  label: EQUIPMENT_TYPE_LABELS[type],
}));

const STATUS_OPTIONS = EQUIPMENT_STATUSES.map((status) => ({
  value: status,
  label: EQUIPMENT_STATUS_LABELS[status],
}));

function toFormValues(equipment?: Equipment): EquipmentFormValues {
  return {
    name: equipment?.name ?? '',
    type: equipment?.type ?? 'kite',
    brand: equipment?.brand ?? '',
    model: equipment?.model ?? '',
    size: equipment?.size ?? '',
    serialNumber: equipment?.serialNumber ?? '',
    status: equipment?.status ?? 'available',
    notes: equipment?.notes ?? '',
  };
}

export function EquipmentFormModal({
  state,
  isSubmitting,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormValues>({ resolver: zodResolver(equipmentSchema) });

  useEffect(() => {
    if (state) reset(toFormValues(state.equipment));
  }, [state, reset]);

  const submit = (values: EquipmentFormValues) =>
    onSubmit({
      ...values,
      brand: emptyToNull(values.brand),
      model: emptyToNull(values.model),
      size: emptyToNull(values.size),
      serialNumber: emptyToNull(values.serialNumber),
      notes: emptyToNull(values.notes),
    });

  return (
    <Modal
      opened={state !== null}
      onClose={onClose}
      title={state?.equipment ? 'Edit equipment' : 'New equipment'}
      size="lg"
      radius="lg"
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <Stack>
          <Group grow align="start">
            <TextInput
              label="Name"
              placeholder="Rebel 9 #2"
              description="How the team identifies it"
              {...register('name')}
              error={errors.name?.message}
            />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  label="Type"
                  description="Category of gear"
                  data={TYPE_OPTIONS}
                  allowDeselect={false}
                  {...field}
                  error={errors.type?.message}
                />
              )}
            />
          </Group>
          <Group grow align="start">
            <TextInput label="Brand" placeholder="Duotone" {...register('brand')} />
            <TextInput label="Model" placeholder="Rebel SLS" {...register('model')} />
          </Group>
          <Group grow align="start">
            <TextInput
              label="Size"
              placeholder="9 m², 138x41, M…"
              {...register('size')}
              error={errors.size?.message}
            />
            <TextInput
              label="Serial number"
              description="Optional, must be unique"
              {...register('serialNumber')}
              error={errors.serialNumber?.message}
            />
          </Group>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Stack gap={4}>
                <Text fz="sm" fw={500}>
                  Status
                </Text>
                <SegmentedControl data={STATUS_OPTIONS} {...field} />
                <Text fz="xs" c="dimmed">
                  Only available equipment can be assigned to new lessons
                </Text>
              </Stack>
            )}
          />
          <Textarea label="Notes" autosize minRows={2} {...register('notes')} />
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
