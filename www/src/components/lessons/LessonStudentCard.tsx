import {
  ActionIcon,
  Badge,
  Card,
  Grid,
  Group,
  NumberInput,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import { studentProgressQuery } from '@/queries/students';
import type { LessonFormValues } from '@/schemas/lesson-schema';
import type { SkillTreeNode } from '@/types/skill';
import { fullName } from '@/utils/format';
import { toNumberOrNull } from '@/utils/form';
import { statusBySkill } from '@/utils/progress';
import { SkillRecordsEditor } from './SkillRecordsEditor';

interface LessonStudentCardProps {
  index: number;
  tree: SkillTreeNode[];
  onRemove: () => void;
}

export function LessonStudentCard({ index, tree, onRemove }: LessonStudentCardProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LessonFormValues>();
  const student = useWatch({ control, name: `students.${index}` });
  const { data: progress } = useQuery(studentProgressQuery(student.studentId));
  const fieldErrors = errors.students?.[index];
  const recordsCount = Object.keys(student.records).length;
  const person = {
    id: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
  };

  return (
    <Card withBorder padding="lg" className="fade-in-up">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <PersonAvatar person={person} radius="xl" />
          <div>
            <Text fw={700}>{fullName(person)}</Text>
            <Text fz="xs" c="dimmed">
              {progress
                ? `${progress.totalLessons} lessons · ${progress.summary.mastered}/${progress.summary.totalSkills} mastered`
                : 'Loading progress…'}
            </Text>
          </div>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Badge variant="light" visibleFrom="xs">
            {recordsCount} recorded
          </Badge>
          <Tooltip label="Remove from lesson">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onRemove}
              aria-label="Remove student"
            >
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Grid mb="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Controller
            control={control}
            name={`students.${index}.kiteSizeM2`}
            render={({ field }) => (
              <NumberInput
                label="Kite"
                suffix=" m²"
                min={0}
                max={30}
                decimalScale={1}
                value={field.value ?? ''}
                onChange={(value) => field.onChange(toNumberOrNull(value))}
                error={fieldErrors?.kiteSizeM2?.message}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <TextInput
            label="Board"
            placeholder="Twin tip 138"
            {...register(`students.${index}.board`)}
            error={fieldErrors?.board?.message}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea
            label="Student notes for this lesson"
            autosize
            minRows={1}
            {...register(`students.${index}.notes`)}
          />
        </Grid.Col>
      </Grid>

      <Text fw={600} mb="xs">
        Skills worked on
      </Text>
      <Controller
        control={control}
        name={`students.${index}.records`}
        render={({ field }) => (
          <SkillRecordsEditor
            tree={tree}
            value={field.value}
            onChange={field.onChange}
            currentStatuses={progress ? statusBySkill(progress.tree) : undefined}
          />
        )}
      />
    </Card>
  );
}
