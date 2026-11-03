import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  SegmentedControl,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import {
  EquipmentFormModal,
  type EquipmentModalState,
} from '@/components/equipment/EquipmentFormModal';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { usePagedSearch } from '@/hooks/usePagedSearch';
import {
  useCreateEquipment,
  useDeleteEquipment,
  useUpdateEquipment,
} from '@/mutations/equipment';
import { equipmentListQuery } from '@/queries/equipment';
import {
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUSES,
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPES,
  type Equipment,
  type EquipmentInput,
  type EquipmentStatus,
  type EquipmentType,
} from '@/types/equipment';
import { notifyError, notifySuccess } from '@/utils/notifications';

const PAGE_SIZE = 15;

type StatusFilter = EquipmentStatus | 'all';

function EquipmentRow({
  equipment,
  onEdit,
  onDelete,
}: {
  equipment: Equipment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const details = [equipment.brand, equipment.model].filter(Boolean).join(' ');
  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={600} fz="sm">
          {equipment.name}
        </Text>
        {details && (
          <Text fz="xs" c="dimmed">
            {details}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge variant="light" radius="sm">
          {EQUIPMENT_TYPE_LABELS[equipment.type]}
        </Badge>
      </Table.Td>
      <Table.Td>{equipment.size ?? <Text c="dimmed">—</Text>}</Table.Td>
      <Table.Td>
        {equipment.serialNumber ? (
          <Text fz="sm" ff="monospace">
            {equipment.serialNumber}
          </Text>
        ) : (
          <Text c="dimmed">—</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge variant="dot" color={EQUIPMENT_STATUS_COLORS[equipment.status]}>
          {EQUIPMENT_STATUS_LABELS[equipment.status]}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="end" wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" onClick={onEdit} aria-label="Edit">
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onDelete}
              aria-label="Delete"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export function InventoryPage() {
  const { search, setSearch, debouncedSearch, page, setPage } = usePagedSearch();
  const [type, setType] = useState<EquipmentType | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [modal, setModal] = useState<EquipmentModalState>(null);
  const { data, isPending } = useQuery(
    equipmentListQuery({
      search: debouncedSearch,
      type: type ?? undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
  );
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const confirmDelete = useConfirmDelete(useDeleteEquipment());

  function save(input: EquipmentInput) {
    const callbacks = {
      onSuccess: () => {
        notifySuccess('Equipment saved');
        setModal(null);
      },
      onError: notifyError,
    };
    if (modal?.equipment) {
      updateEquipment.mutate({ id: modal.equipment.id, input }, callbacks);
    } else {
      createEquipment.mutate(input, callbacks);
    }
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="School equipment that can be assigned to lessons"
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setModal({})}>
            New equipment
          </Button>
        }
      />
      <Card withBorder padding="lg" className="fade-in-up">
        <Group mb="md">
          <TextInput
            placeholder="Search by name, brand, model or serial number"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <Select
            placeholder="All types"
            data={EQUIPMENT_TYPES.map((value) => ({
              value,
              label: EQUIPMENT_TYPE_LABELS[value],
            }))}
            value={type}
            onChange={(value) => {
              setType(value as EquipmentType | null);
              setPage(1);
            }}
            clearable
            w={170}
          />
          <SegmentedControl
            radius="xl"
            value={status}
            onChange={(value) => {
              setStatus(value as StatusFilter);
              setPage(1);
            }}
            data={[
              { value: 'all', label: 'All' },
              ...EQUIPMENT_STATUSES.map((value) => ({
                value,
                label: EQUIPMENT_STATUS_LABELS[value],
              })),
            ]}
          />
        </Group>
        {!isPending && data?.items.length === 0 ? (
          <EmptyState
            title="No equipment"
            description="Add the school's kites, boards and gear to assign them to lessons."
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={720}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Equipment</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Size</Table.Th>
                    <Table.Th>Serial number</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data?.items.map((equipment) => (
                    <EquipmentRow
                      key={equipment.id}
                      equipment={equipment}
                      onEdit={() => setModal({ equipment })}
                      onDelete={() =>
                        confirmDelete(equipment.id, {
                          title: 'Delete equipment',
                          message: `Are you sure you want to delete ${equipment.name}? If it was used in lessons, retire it instead.`,
                          successMessage: 'Equipment deleted',
                        })
                      }
                    />
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            {data && (
              <PaginationFooter
                page={page}
                limit={PAGE_SIZE}
                total={data.total}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Card>
      <EquipmentFormModal
        state={modal}
        isSubmitting={createEquipment.isPending || updateEquipment.isPending}
        onClose={() => setModal(null)}
        onSubmit={save}
      />
    </>
  );
}
