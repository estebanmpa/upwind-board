import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { SubmitButton } from '@/components/common/SubmitButton';
import { studentSchema, type StudentFormValues } from '@/schemas/student-schema';
import type { Student, StudentInput } from '@/types/student';
import { emptyToNull, toNumberOrNull } from '@/utils/form';

interface StudentFormProps {
  student?: Student;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: StudentInput) => void;
}

function toFormValues(student?: Student): StudentFormValues {
  return {
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    email: student?.email ?? '',
    phone: student?.phone ?? '',
    birthDate: student?.birthDate ? dayjs(student.birthDate).toDate() : null,
    weightKg: student?.weightKg ?? null,
    emergencyContactName: student?.emergencyContactName ?? '',
    emergencyContactPhone: student?.emergencyContactPhone ?? '',
    notes: student?.notes ?? '',
  };
}

function toStudentInput(values: StudentFormValues): StudentInput {
  return {
    ...values,
    email: emptyToNull(values.email),
    birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
    notes: emptyToNull(values.notes),
  };
}

export function StudentForm({
  student,
  submitLabel,
  isSubmitting,
  onSubmit,
}: StudentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: toFormValues(student),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(toStudentInput(values)))}
      noValidate
    >
      <Paper withBorder p="lg" maw={860} className="fade-in-up">
        <Stack>
          <Title order={4}>Personal details</Title>
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
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email"
                description="Optional"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <DateInput
                    label="Birth date"
                    description="Optional"
                    valueFormat="DD/MM/YYYY"
                    maxDate={new Date()}
                    clearable
                    {...field}
                    error={errors.birthDate?.message}
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                control={control}
                name="weightKg"
                render={({ field }) => (
                  <NumberInput
                    label="Weight"
                    description="Optional, helps choose the kite size"
                    suffix=" kg"
                    min={0}
                    decimalScale={1}
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(toNumberOrNull(value))}
                    error={errors.weightKg?.message}
                  />
                )}
              />
            </Grid.Col>
          </Grid>

          <Title order={4} mt="sm">
            Emergency contact
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Name"
                {...register('emergencyContactName')}
                error={errors.emergencyContactName?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                {...register('emergencyContactPhone')}
                error={errors.emergencyContactPhone?.message}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Notes"
            description="Previous experience, medical conditions, goals…"
            autosize
            minRows={3}
            {...register('notes')}
          />
          <Group justify="end">
            <SubmitButton label={submitLabel} loading={isSubmitting} />
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
