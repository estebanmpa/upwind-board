import { Button, Card, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendarEvent,
  IconClockHour4,
  IconPlus,
  IconSchool,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { LessonsTable } from '@/components/lessons/LessonsTable';
import { instructorsQuery } from '@/queries/instructors';
import { lessonsQuery } from '@/queries/lessons';
import { studentsQuery } from '@/queries/students';
import { formatHours } from '@/utils/format';

const RECENT_LESSONS = 6;
// The API caps pages at 100: enough to add up a month of lessons.
const MONTH_LESSONS_LIMIT = 100;

function useMonthStats() {
  const from = dayjs().startOf('month').toISOString();
  const { data } = useQuery(lessonsQuery({ from, limit: MONTH_LESSONS_LIMIT }));
  const minutes = data?.items.reduce(
    (total, lesson) => total + lesson.durationMinutes,
    0,
  );
  return {
    lessons: data?.total,
    hours: minutes === undefined ? undefined : minutes / 60,
  };
}

export function DashboardPage() {
  const { data: students } = useQuery(studentsQuery({ limit: 1 }));
  const { data: instructors } = useQuery(instructorsQuery({ active: true, limit: 1 }));
  const { data: recent, isPending } = useQuery(lessonsQuery({ limit: RECENT_LESSONS }));
  const month = useMonthStats();

  return (
    <>
      <PageHeader
        title="Resumen"
        description={`Actividad de la escuela · ${dayjs().format('MMMM YYYY')}`}
      />
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="xl" className="fade-in-up">
        <StatCard
          label="Clases del mes"
          value={month.lessons ?? '—'}
          icon={IconCalendarEvent}
          color="brand"
        />
        <StatCard
          label="Horas del mes"
          value={month.hours === undefined ? '—' : formatHours(month.hours)}
          icon={IconClockHour4}
          color="teal"
        />
        <StatCard
          label="Alumnos"
          value={students?.total ?? '—'}
          icon={IconUsers}
          color="cyan"
        />
        <StatCard
          label="Instructores activos"
          value={instructors?.total ?? '—'}
          icon={IconSchool}
          color="indigo"
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Últimas clases</Title>
              <Button variant="subtle" size="xs" component={Link} to="/clases">
                Ver todas
              </Button>
            </Group>
            {!isPending && recent?.items.length === 0 ? (
              <EmptyState
                title="Sin clases todavía"
                description="Registrá la primera clase para empezar a seguir la progresión."
              />
            ) : (
              <LessonsTable lessons={recent?.items ?? []} />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder padding="lg" h="100%" className="gradient-surface">
            <Stack justify="space-between" h="100%">
              <div>
                <Title order={3} c="white">
                  ¿Terminaste una clase?
                </Title>
                <Text c="white" opacity={0.85} mt="xs">
                  Registrala con los alumnos y lo que trabajó cada uno. La progresión IKO
                  se actualiza sola.
                </Text>
              </div>
              <Stack gap="xs">
                <Button
                  component={Link}
                  to="/clases/nueva"
                  variant="white"
                  leftSection={<IconPlus size={18} />}
                >
                  Registrar clase
                </Button>
                <Button
                  component={Link}
                  to="/alumnos/nuevo"
                  variant="outline"
                  color="white"
                  leftSection={<IconUserPlus size={18} />}
                >
                  Nuevo alumno
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
