import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { Lesson } from '@/types/lesson';
import { formatTime, formatWind, fullName, isUpcoming } from '@/utils/format';
import { LessonStudentAvatars } from './LessonsTable';

export function ScheduleLessonCard({ lesson }: { lesson: Lesson }) {
  const endsAt = dayjs(lesson.startsAt).add(lesson.durationMinutes, 'minute');
  const wind = formatWind(lesson);
  return (
    <Paper
      renderRoot={(props) => (
        <Link to="/lessons/$lessonId" params={{ lessonId: lesson.id }} {...props} />
      )}
      withBorder
      p="sm"
      radius="md"
      className="hover-lift"
      // Lessons already given stay visible but step back.
      opacity={isUpcoming(lesson.startsAt) ? 1 : 0.6}
      style={{
        display: 'block',
        borderLeft: `4px solid var(--mantine-color-${lesson.instructor ? 'brand' : 'orange'}-5)`,
      }}
    >
      <Stack gap={6}>
        <Text fz="sm" fw={700}>
          {formatTime(lesson.startsAt)}–{formatTime(endsAt.toISOString())}
        </Text>
        <Group gap={4} wrap="nowrap">
          <IconMapPin size={14} />
          <Text fz="sm" truncate>
            {lesson.spot}
          </Text>
        </Group>
        {lesson.instructor ? (
          <Text fz="xs" c="dimmed" truncate>
            {fullName(lesson.instructor)}
          </Text>
        ) : (
          <Badge size="xs" variant="outline" color="orange" w="fit-content">
            Unassigned
          </Badge>
        )}
        <Group justify="space-between" gap="xs">
          <LessonStudentAvatars lesson={lesson} />
          {wind && (
            <Badge size="xs" variant="light" color="cyan">
              {wind}
            </Badge>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
