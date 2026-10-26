import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import type { UseMutationResult } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/utils/notifications';

interface ConfirmDeleteOptions {
  title: string;
  message: string;
  successMessage: string;
  onDeleted?: () => void;
}

/** Opens a confirmation modal and runs the delete mutation on confirm. */
export function useConfirmDelete(mutation: UseMutationResult<void, Error, string>) {
  return (id: string, options: ConfirmDeleteOptions) =>
    modals.openConfirmModal({
      title: options.title,
      children: <Text fz="sm">{options.message}</Text>,
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        mutation.mutate(id, {
          onSuccess: () => {
            notifySuccess(options.successMessage);
            options.onDeleted?.();
          },
          onError: notifyError,
        }),
    });
}
