import {
  Button,
  Card,
  Grid,
  Group,
  RingProgress,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClockHour4,
  IconEdit,
  IconId,
  IconListTree,
  IconPlus,
  IconTimeline,
  IconTrophy,
} from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import { StatCard } from '@/components/common/StatCard';
import { StatusLegend } from '@/components/skills/StatusLegend';
import { StudentLessonTimeline } from '@/components/students/StudentLessonTimeline';
import { StudentProgressTree } from '@/components/students/StudentProgressTree';
import { studentProgressQuery, studentQuery } from '@/queries/students';
import type { Student } from '@/types/student';
import { calculateAge, formatHours, fullName } from '@/utils/format';
import { currentLevel, masteredPercent } from '@/utils/progress';

function ProfileHeader({ student }: { student: Student }) {
  const details = [
    student.birthDate && `${calculateAge(student.birthDate)} años`,
    student.weightKg && `${student.weightKg} kg`,
    student.phone,
  ].filter(Boolean);
  return (
    <Group justify="space-between" align="center" mb="xl" className="fade-in-up">
      <Group wrap="nowrap">
        <PersonAvatar person={student} size={72} radius="xl" variant="gradient" />
        <div>
          <Title order={2}>{fullName(student)}</Title>
          <Text c="dimmed">{details.join(' · ')}</Text>
        </div>
      </Group>
      <Group gap="sm">
        <Button
          variant="default"
          renderRoot={(props) => (
            <Link
              {...props}
              to="/alumnos/$studentId/editar"
              params={{ studentId: student.id }}
            />
          )}
          leftSection={<IconEdit size={18} />}
        >
          Editar
        </Button>
        <Button
          variant="gradient"
          renderRoot={(props) => (
            <Link {...props} to="/clases/nueva" search={{ studentId: student.id }} />
          )}
          leftSection={<IconPlus size={18} />}
        >
          Registrar clase
        </Button>
      </Group>
    </Group>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text>{value || '—'}</Text>
    </div>
  );
}

function StudentInfo({ student }: { student: Student }) {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Contacto
          </Title>
          <Stack gap="sm">
            <InfoRow label="Teléfono" value={student.phone} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Fecha de nacimiento" value={student.birthDate} />
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Emergencias
          </Title>
          <Stack gap="sm">
            <InfoRow label="Contacto" value={student.emergencyContactName} />
            <InfoRow label="Teléfono" value={student.emergencyContactPhone} />
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={12}>
        <Card withBorder padding="lg">
          <Title order={4} mb="xs">
            Notas
          </Title>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{student.notes || 'Sin notas'}</Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

export function StudentProfilePage({ studentId }: { studentId: string }) {
  const { data: student } = useSuspenseQuery(studentQuery(studentId));
  const { data: progress } = useSuspenseQuery(studentProgressQuery(studentId));
  const { summary } = progress;
  const level = currentLevel(progress.tree);
  const percent = masteredPercent(summary);

  return (
    <>
      <ProfileHeader student={student} />
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="xl" className="fade-in-up">
        <StatCard
          label="Clases"
          value={progress.totalLessons}
          icon={IconCalendarEvent}
          color="brand"
        />
        <StatCard
          label="Horas en el agua"
          value={formatHours(progress.totalHours)}
          icon={IconClockHour4}
          color="teal"
        />
        <StatCard
          label="Dominadas"
          value={`${summary.mastered}/${summary.totalSkills}`}
          icon={IconTrophy}
          color="orange"
          hint={
            level ? `Trabajando ${level.code} · ${level.name}` : 'Progresión completa'
          }
        />
        <Card withBorder padding="lg" className="hover-lift">
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
                Progreso IKO
              </Text>
              <Text fz={28} fw={800}>
                {percent}%
              </Text>
            </div>
            <RingProgress
              size={64}
              thickness={7}
              roundCaps
              sections={[{ value: percent, color: 'teal' }]}
            />
          </Group>
        </Card>
      </SimpleGrid>

      <Tabs defaultValue="progress" variant="pills" radius="xl">
        <Tabs.List mb="lg">
          <Tabs.Tab value="progress" leftSection={<IconListTree size={16} />}>
            Progresión
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconTimeline size={16} />}>
            Historial
          </Tabs.Tab>
          <Tabs.Tab value="info" leftSection={<IconId size={16} />}>
            Ficha
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="progress">
          <Group justify="end" mb="sm">
            <StatusLegend />
          </Group>
          <StudentProgressTree tree={progress.tree} />
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <Card withBorder padding="lg">
            <StudentLessonTimeline studentId={studentId} />
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="info">
          <StudentInfo student={student} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
