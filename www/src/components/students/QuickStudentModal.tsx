import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useCreateStudent } from '@/mutations/students';
import {
  quickStudentSchema,
  type QuickStudentFormValues,
} from '@/schemas/student-schema';
import type { Student } from '@/types/student';
import { notifyError, notifySuccess } from '@/utils/notifications';

interface QuickStudentModalProps {
  opened: boolean;
  /** What was typed in the search, used to prefill the name. */
  initialName: string;
  onClose: () => void;
  onCreated: (student: Student) => void;
}

/** "Ana María López" → first "Ana María", last "López". */
export function splitFullName(
  name: string,
): Pick<QuickStudentFormValues, 'firstName' | 'lastName'> {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

export function QuickStudentModal({
  opened,
  initialName,
  onClose,
  onCreated,
}: QuickStudentModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="New student" centered>
      {/* Remounted on every opening so the name prefill is fresh. */}
      {opened && <QuickStudentForm initialName={initialName} onCreated={onCreated} />}
    </Modal>
  );
}

function QuickStudentForm({
  initialName,
  onCreated,
}: Pick<QuickStudentModalProps, 'initialName' | 'onCreated'>) {
  const createStudent = useCreateStudent();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickStudentFormValues>({
    resolver: zodResolver(quickStudentSchema),
    defaultValues: { ...splitFullName(initialName), email: '' },
  });

  const save = handleSubmit((values) =>
    createStudent.mutate(
      {
        ...values,
        phone: null,
        birthDate: null,
        weightKg: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        notes: null,
      },
      {
        onSuccess: (student) => {
          notifySuccess('Student created');
          onCreated(student);
        },
        onError: notifyError,
      },
    ),
  );

  return (
    <form
      onSubmit={(event) => {
        // The modal is portalled, but React still bubbles submit to the lesson form.
        event.stopPropagation();
        void save(event);
      }}
      noValidate
    >
      <Stack>
        <Text fz="sm" c="dimmed">
          The rest of their details can be completed later from their profile.
        </Text>
        <Group grow align="start">
          <TextInput
            label="First name"
            data-autofocus
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <TextInput
            label="Last name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </Group>
        <TextInput
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Group justify="end">
          <Button
            type="submit"
            variant="gradient"
            loading={createStudent.isPending}
            leftSection={<IconUserPlus size={18} />}
          >
            Create and add
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
