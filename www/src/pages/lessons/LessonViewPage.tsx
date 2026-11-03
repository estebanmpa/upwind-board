import type { ReactNode } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCalendarClock,
  IconEdit,
  IconInfoCircle,
  IconTrash,
} from '@tabler/icons-react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import { SkillStatusBadge } from '@/components/skills/SkillStatusBadge';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useGoBack } from '@/hooks/useGoBack';
import { useDeleteLesson } from '@/mutations/lessons';
import { lessonQuery } from '@/queries/lessons';
import { skillTreeQuery } from '@/queries/skills';
import { EQUIPMENT_TYPE_LABELS } from '@/types/equipment';
import type { Lesson, LessonStudent } from '@/types/lesson';
import type { SkillTreeNode } from '@/types/skill';
import { equipmentLabel } from '@/utils/equipment';
import {
  formatDateTime,
  formatDuration,
  formatWind,
  fullName,
  isUpcoming,
} from '@/utils/format';
import { recordsInTreeOrder } from '@/utils/skill-tree';

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      {children}
    </div>
  );
}

function SkillRecordList({
  participation,
  tree,
}: {
  participation: LessonStudent;
  tree: SkillTreeNode[];
}) {
  if (participation.skillRecords.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        No skills recorded
      </Text>
    );
  }
  return (
    <Stack gap={6}>
      {recordsInTreeOrder(participation.skillRecords, tree).map(({ record, skill }) => (
        <div key={record.id}>
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Group gap="xs" wrap="nowrap">
              {skill && (
                <Badge variant="light" color="teal" radius="sm">
                  {skill.code}
                </Badge>
              )}
              <Text fz="sm">{skill?.name ?? 'Unknown skill'}</Text>
            </Group>
            <SkillStatusBadge status={record.status} size="sm" />
          </Group>
          {record.notes && (
            <Text fz="xs" c="dimmed" fs="italic" mt={2}>
              “{record.notes}”
            </Text>
          )}
        </div>
      ))}
    </Stack>
  );
}

function StudentCard({
  participation,
  tree,
}: {
  participation: LessonStudent;
  tree: SkillTreeNode[];
}) {
  const { student } = participation;
  const gear = [
    participation.kiteSizeM2 && `Kite ${participation.kiteSizeM2} m²`,
    participation.board,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Card withBorder padding="lg" className="hover-lift fade-in-up">
      <Group justify="space-between" wrap="nowrap" mb="sm">
        <Group wrap="nowrap">
          <PersonAvatar person={student} radius="xl" />
          <div>
            <Anchor
              fw={700}
              renderRoot={(props) => (
                <Link
                  {...props}
                  to="/students/$studentId"
                  params={{ studentId: student.id }}
                />
              )}
            >
              {fullName(student)}
            </Anchor>
            {gear && (
              <Text fz="xs" c="dimmed">
                {gear}
              </Text>
            )}
          </div>
        </Group>
        <Text fz="sm" c="dimmed">
          {participation.skillRecords.length} skills
        </Text>
      </Group>
      {participation.notes && (
        <Text fz="sm" fs="italic" mb="sm">
          “{participation.notes}”
        </Text>
      )}
      <SkillRecordList participation={participation} tree={tree} />
    </Card>
  );
}

function LessonDetails({ lesson }: { lesson: Lesson }) {
  const wind = formatWind(lesson);
  return (
    <Card withBorder padding="lg" className="sticky-aside glass">
      <Stack gap="md">
        <Title order={4}>Details</Title>
        <DetailRow label="Instructor">
          {lesson.instructor ? (
            <Group gap="xs" mt={2}>
              <PersonAvatar person={lesson.instructor} radius="xl" size="sm" />
              <Text>{fullName(lesson.instructor)}</Text>
            </Group>
          ) : (
            <Badge variant="outline" color="orange" mt={2}>
              Unassigned
            </Badge>
          )}
        </DetailRow>
        <DetailRow label="Date">
          <Text>{formatDateTime(lesson.startsAt)}</Text>
        </DetailRow>
        <DetailRow label="Duration">
          <Text>{formatDuration(lesson.durationMinutes)}</Text>
        </DetailRow>
        <DetailRow label="Wind">
          <Text>{wind || '—'}</Text>
        </DetailRow>
        <Divider />
        <DetailRow label="Equipment">
          {lesson.equipment.length === 0 ? (
            <Text>—</Text>
          ) : (
            <Stack gap={4} mt={4}>
              {lesson.equipment.map((item) => (
                <Group key={item.id} justify="space-between" wrap="nowrap">
                  <Text fz="sm">{equipmentLabel(item)}</Text>
                  <Badge variant="light" radius="sm" size="sm">
                    {EQUIPMENT_TYPE_LABELS[item.type]}
                  </Badge>
                </Group>
              ))}
            </Stack>
          )}
        </DetailRow>
        <DetailRow label="Notes">
          <Text style={{ whiteSpace: 'pre-wrap' }}>{lesson.notes || '—'}</Text>
        </DetailRow>
      </Stack>
    </Card>
  );
}

export function LessonViewPage({ lessonId }: { lessonId: string }) {
  const { data: lesson } = useSuspenseQuery(lessonQuery(lessonId));
  const { data: tree = [] } = useQuery(skillTreeQuery(true));
  const deleteLesson = useDeleteLesson();
  const confirmDelete = useConfirmDelete(deleteLesson);
  const goBack = useGoBack({ to: '/lessons' });
  const scheduled = isUpcoming(lesson.startsAt);

  return (
    <>
      <PageHeader
        back={{ to: '/lessons' }}
        title={
          <Group gap="sm">
            {lesson.spot}
            {scheduled && (
              <Badge
                variant="light"
                color="violet"
                leftSection={<IconCalendarClock size={12} />}
              >
                Scheduled
              </Badge>
            )}
          </Group>
        }
        description={formatDateTime(lesson.startsAt)}
        actions={
          <>
            <Button
              variant="subtle"
              color="red"
              loading={deleteLesson.isPending}
              leftSection={<IconTrash size={18} />}
              onClick={() =>
                confirmDelete(lessonId, {
                  title: 'Delete lesson',
                  message:
                    "Its students' skill records are deleted too and their progression is recalculated.",
                  successMessage: 'Lesson deleted',
                  onDeleted: goBack,
                })
              }
            >
              Delete
            </Button>
            <Button
              variant="gradient"
              renderRoot={(props) => (
                <Link {...props} to="/lessons/$lessonId/edit" params={{ lessonId }} />
              )}
              leftSection={<IconEdit size={18} />}
            >
              Edit
            </Button>
          </>
        }
      />
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            {scheduled && (
              <Alert variant="light" color="violet" icon={<IconInfoCircle size={18} />}>
                {lesson.instructor
                  ? 'Skills can be recorded once the lesson has started.'
                  : 'Assign an instructor before the lesson starts to record skills.'}
              </Alert>
            )}
            <Group justify="space-between">
              <Title order={4}>Students</Title>
              <Text c="dimmed" fz="sm">
                {lesson.students.length} in the lesson
              </Text>
            </Group>
            {lesson.students.length === 0 ? (
              <Card withBorder padding="lg">
                <EmptyState title="No students" />
              </Card>
            ) : (
              lesson.students.map((participation) => (
                <StudentCard
                  key={participation.id}
                  participation={participation}
                  tree={tree}
                />
              ))
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <LessonDetails lesson={lesson} />
        </Grid.Col>
      </Grid>
    </>
  );
}
