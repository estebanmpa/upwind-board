import {
  Anchor,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
} from '@mantine/core';
import { IconParachute } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { SkillStatusBadge } from '@/components/skills/SkillStatusBadge';
import { studentLessonsQuery } from '@/queries/students';
import type { StudentLessonHistoryItem } from '@/types/progress';
import { formatDateTime, formatDuration, formatWind, fullName } from '@/utils/format';

function LessonDetails({ item }: { item: StudentLessonHistoryItem }) {
  const equipment = [item.kiteSizeM2 && `Kite ${item.kiteSizeM2} m²`, item.board]
    .filter(Boolean)
    .join(' · ');
  return (
    <Stack gap={6} mt={4}>
      <Text fz="sm" c="dimmed">
        {fullName(item.instructor)} · {formatDuration(item.durationMinutes)}
        {formatWind(item) && ` · ${formatWind(item)}`}
        {equipment && ` · ${equipment}`}
      </Text>
      {item.skillRecords.length > 0 && (
        <Group gap={6}>
          {item.skillRecords.map((record) => (
            <Group key={record.id} gap={4} wrap="nowrap">
              <Text fz="xs">{record.skillName}</Text>
              <SkillStatusBadge status={record.status} size="xs" />
            </Group>
          ))}
        </Group>
      )}
      {item.studentNotes && (
        <Text fz="sm" fs="italic">
          “{item.studentNotes}”
        </Text>
      )}
    </Stack>
  );
}

export function StudentLessonTimeline({ studentId }: { studentId: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(studentLessonsQuery(studentId));
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isPending && items.length === 0) {
    return (
      <EmptyState
        title="No lessons yet"
        description="Lessons logged for this student will show up here."
      />
    );
  }

  return (
    <Stack>
      <Timeline bulletSize={30} lineWidth={2} active={items.length}>
        {items.map((item) => (
          <Timeline.Item
            key={item.lessonId}
            bullet={
              <ThemeIcon size={30} radius="xl" variant="gradient">
                <IconParachute size={16} />
              </ThemeIcon>
            }
            title={
              <Group gap="xs">
                <Anchor
                  fw={700}
                  renderRoot={(props) => (
                    <Link
                      {...props}
                      to="/lessons/$lessonId"
                      params={{ lessonId: item.lessonId }}
                    />
                  )}
                >
                  {formatDateTime(item.startsAt)}
                </Anchor>
                <Badge variant="light" color="cyan">
                  {item.spot}
                </Badge>
              </Group>
            }
          >
            <LessonDetails item={item} />
          </Timeline.Item>
        ))}
      </Timeline>
      {hasNextPage && (
        <Button
          variant="light"
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        >
          Load more lessons
        </Button>
      )}
    </Stack>
  );
}
