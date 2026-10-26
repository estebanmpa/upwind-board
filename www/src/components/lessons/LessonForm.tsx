import { useEffect, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconDeviceFloppy, IconUsers } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from 'react-hook-form';
import { EmptyState } from '@/components/common/EmptyState';
import { activeInstructorsQuery } from '@/queries/instructors';
import { skillTreeQuery } from '@/queries/skills';
import { lessonSchema, type LessonFormValues } from '@/schemas/lesson-schema';
import type { PersonSummary } from '@/types/api';
import type { LessonPayload } from '@/types/lesson';
import { WIND_DIRECTIONS } from '@/types/wind';
import { formatDateTime, formatDuration, fullName } from '@/utils/format';
import { toNumberOrNull } from '@/utils/form';
import {
  countRecords,
  emptyLessonStudent,
  formValuesToPayload,
} from '@/utils/lesson-form';
import { LessonStudentCard } from './LessonStudentCard';
import { StudentPicker } from './StudentPicker';

interface LessonFormProps {
  initialValues: Partial<LessonFormValues>;
  /** Keeps an inactive instructor selectable when editing their lessons. */
  currentInstructor?: PersonSummary;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: LessonPayload) => void;
  extraActions?: ReactNode;
}

function useInstructorOptions(currentInstructor?: PersonSummary) {
  const { data } = useQuery(activeInstructorsQuery());
  const instructors = data?.items ?? [];
  const options = instructors.map((instructor) => ({
    value: instructor.id,
    label: fullName(instructor),
  }));
  if (currentInstructor && !instructors.some((i) => i.id === currentInstructor.id)) {
    options.push({
      value: currentInstructor.id,
      label: `${fullName(currentInstructor)} (inactivo)`,
    });
  }
  return options;
}

/** With a single instructor available, there is nothing to choose. */
function useSoleInstructorDefault(
  form: UseFormReturn<LessonFormValues>,
  options: { value: string }[],
) {
  const { getValues, setValue } = form;
  const soleInstructorId = options.length === 1 ? options[0].value : undefined;
  useEffect(() => {
    if (soleInstructorId && !getValues('instructorId')) {
      setValue('instructorId', soleInstructorId);
    }
  }, [soleInstructorId, getValues, setValue]);
}

export function LessonForm({
  initialValues,
  currentInstructor,
  submitLabel,
  isSubmitting,
  onSubmit,
  extraActions,
}: LessonFormProps) {
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initialValues,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'students',
    keyName: 'key',
  });
  const [students, startsAt, durationMinutes] = useWatch({
    control,
    name: ['students', 'startsAt', 'durationMinutes'],
  });
  const instructorOptions = useInstructorOptions(currentInstructor);
  useSoleInstructorDefault(form, instructorOptions);
  const { data: tree = [] } = useQuery(skillTreeQuery(true));

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit((values) => onSubmit(formValuesToPayload(values)))}
        noValidate
      >
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack>
              <Paper withBorder p="lg" className="fade-in-up">
                <Title order={4} mb="md">
                  Clase
                </Title>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="instructorId"
                      render={({ field }) => (
                        <Select
                          label="Instructor"
                          data={instructorOptions}
                          searchable
                          {...field}
                          error={errors.instructorId?.message}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="startsAt"
                      render={({ field }) => (
                        <DateTimePicker
                          label="Fecha y hora"
                          valueFormat="DD/MM/YYYY HH:mm"
                          {...field}
                          error={errors.startsAt?.message}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Spot"
                      placeholder="Punta Lara"
                      {...register('spot')}
                      error={errors.spot?.message}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <NumberInput
                          label="Duración"
                          suffix=" min"
                          step={15}
                          min={1}
                          allowDecimal={false}
                          value={field.value ?? ''}
                          onChange={(value) =>
                            field.onChange(toNumberOrNull(value) ?? undefined)
                          }
                          error={errors.durationMinutes?.message}
                        />
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Controller
                      control={control}
                      name="windDirection"
                      render={({ field }) => (
                        <Select
                          label="Dirección del viento"
                          placeholder="—"
                          data={[...WIND_DIRECTIONS]}
                          searchable
                          clearable
                          {...field}
                        />
                      )}
                    />
                  </Grid.Col>
                  {(['windMinKnots', 'windMaxKnots'] as const).map((name) => (
                    <Grid.Col key={name} span={{ base: 6, sm: 4 }}>
                      <Controller
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <NumberInput
                            label={
                              name === 'windMinKnots' ? 'Viento mín.' : 'Viento máx.'
                            }
                            suffix=" kn"
                            min={0}
                            max={99}
                            allowDecimal={false}
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(toNumberOrNull(value))}
                            error={errors[name]?.message}
                          />
                        )}
                      />
                    </Grid.Col>
                  ))}
                  <Grid.Col span={12}>
                    <Textarea
                      label="Notas de la clase"
                      autosize
                      minRows={2}
                      {...register('notes')}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>

              <Group justify="space-between" mt="md">
                <Title order={4}>Alumnos</Title>
                <Text c="dimmed" fz="sm">
                  {fields.length} en la clase
                </Text>
              </Group>
              <StudentPicker
                excludedIds={students?.map((student) => student.studentId) ?? []}
                onPick={(student) => append(emptyLessonStudent(student))}
              />
              {errors.students?.root?.message || errors.students?.message ? (
                <Alert color="red" variant="light">
                  {errors.students?.root?.message ?? errors.students?.message}
                </Alert>
              ) : null}
              {fields.length === 0 ? (
                <Paper withBorder p="lg">
                  <EmptyState
                    title="Sin alumnos"
                    description="Buscá y agregá los alumnos que tomaron la clase."
                  />
                </Paper>
              ) : (
                fields.map((field, index) => (
                  <LessonStudentCard
                    key={field.key}
                    index={index}
                    tree={tree}
                    onRemove={() => remove(index)}
                  />
                ))
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="lg" className="sticky-aside glass">
              <Stack gap="xs">
                <Title order={4}>Resumen</Title>
                <SummaryRow
                  label="Fecha"
                  value={startsAt ? formatDateTime(startsAt.toISOString()) : '—'}
                />
                <SummaryRow
                  label="Duración"
                  value={durationMinutes ? formatDuration(durationMinutes) : '—'}
                />
                <SummaryRow label="Alumnos" value={String(students?.length ?? 0)} />
                <SummaryRow
                  label="Habilidades registradas"
                  value={String(countRecords(students ?? []))}
                />
                <Divider my="xs" />
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  variant="gradient"
                  loading={isSubmitting}
                  leftSection={<IconDeviceFloppy size={18} />}
                >
                  {submitLabel}
                </Button>
                {extraActions}
                <Group gap={6} mt="xs" wrap="nowrap">
                  <IconUsers size={14} color="var(--mantine-color-dimmed)" />
                  <Text fz="xs" c="dimmed">
                    Cada alumno guarda su propio registro de habilidades.
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </form>
    </FormProvider>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text fz="sm" c="dimmed">
        {label}
      </Text>
      <Text fz="sm" fw={600}>
        {value}
      </Text>
    </Group>
  );
}
