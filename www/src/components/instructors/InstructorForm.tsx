import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Group, Paper, Stack, Switch, TextInput } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { SubmitButton } from '@/components/common/SubmitButton';
import { instructorSchema, type InstructorFormValues } from '@/schemas/instructor-schema';
import type { Instructor, InstructorInput } from '@/types/instructor';
import { emptyToNull } from '@/utils/form';

interface InstructorFormProps {
  instructor?: Instructor;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: InstructorInput) => void;
}

function toFormValues(instructor?: Instructor): InstructorFormValues {
  return {
    firstName: instructor?.firstName ?? '',
    lastName: instructor?.lastName ?? '',
    email: instructor?.email ?? '',
    phone: instructor?.phone ?? '',
    ikoInstructorId: instructor?.ikoInstructorId ?? '',
    active: instructor?.active ?? true,
  };
}

export function InstructorForm({
  instructor,
  submitLabel,
  isSubmitting,
  onSubmit,
}: InstructorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: toFormValues(instructor),
  });

  const submit = (values: InstructorFormValues) =>
    onSubmit({ ...values, ikoInstructorId: emptyToNull(values.ikoInstructorId) });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Paper withBorder p="lg" maw={760} className="fade-in-up">
        <Stack>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="First name"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Last name"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="IKO instructor ID"
                description="Optional"
                {...register('ikoInstructorId')}
                error={errors.ikoInstructorId?.message}
              />
            </Grid.Col>
          </Grid>
          <Controller
            control={control}
            name="active"
            render={({ field: { value, ...field } }) => (
              <Switch
                label="Active"
                description="Only active instructors can be assigned to new lessons"
                checked={value}
                {...field}
              />
            )}
          />
          <Group justify="end">
            <SubmitButton label={submitLabel} loading={isSubmitting} />
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
