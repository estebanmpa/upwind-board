import { Avatar, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import type { Lesson } from '@/types/lesson';
import {
  formatDate,
  formatDuration,
  formatTime,
  formatWind,
  fullName,
  isUpcoming,
} from '@/utils/format';

const MAX_AVATARS = 4;

export function LessonStudentAvatars({ lesson }: { lesson: Lesson }) {
  const shown = lesson.students.slice(0, MAX_AVATARS);
  const hidden = lesson.students.length - shown.length;
  return (
    <Tooltip.Group openDelay={200}>
      <Avatar.Group>
        {shown.map(({ student }) => (
          <Tooltip key={student.id} label={fullName(student)} withArrow>
            <PersonAvatar person={student} radius="xl" size="sm" />
          </Tooltip>
        ))}
        {hidden > 0 && (
          <Avatar radius="xl" size="sm">
            +{hidden}
          </Avatar>
        )}
      </Avatar.Group>
    </Tooltip.Group>
  );
}

export function LessonsTable({ lessons }: { lessons: Lesson[] }) {
  const navigate = useNavigate();
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Spot</Table.Th>
            <Table.Th>Instructor</Table.Th>
            <Table.Th>Students</Table.Th>
            <Table.Th>Wind</Table.Th>
            <Table.Th ta="right">Duration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lessons.map((lesson) => (
            <Table.Tr
              key={lesson.id}
              className="clickable-row"
              onClick={() =>
                navigate({ to: '/lessons/$lessonId', params: { lessonId: lesson.id } })
              }
            >
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <Text fz="sm" fw={600}>
                    {formatDate(lesson.startsAt)}
                  </Text>
                  {isUpcoming(lesson.startsAt) && (
                    <Badge size="xs" variant="light" color="violet">
                      Scheduled
                    </Badge>
                  )}
                </Group>
                <Text fz="xs" c="dimmed">
                  {formatTime(lesson.startsAt)}
                </Text>
              </Table.Td>
              <Table.Td>{lesson.spot}</Table.Td>
              <Table.Td>
                {lesson.instructor ? (
                  fullName(lesson.instructor)
                ) : (
                  <Badge variant="outline" color="orange">
                    Unassigned
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>
                <LessonStudentAvatars lesson={lesson} />
              </Table.Td>
              <Table.Td>
                {formatWind(lesson) ? (
                  <Badge variant="light" color="cyan">
                    {formatWind(lesson)}
                  </Badge>
                ) : (
                  <Text c="dimmed">—</Text>
                )}
              </Table.Td>
              <Table.Td ta="right">{formatDuration(lesson.durationMinutes)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
