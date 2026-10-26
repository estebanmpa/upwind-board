import { notifications } from '@mantine/notifications';
import { ApiError } from '@/api/http';

const STATUS_TITLES: Record<number, string> = {
  0: 'No connection',
  400: 'Invalid data',
  404: 'Not found',
  409: 'The operation cannot be completed',
};

function errorTitle(error: unknown): string {
  return error instanceof ApiError
    ? (STATUS_TITLES[error.status] ?? 'Server error')
    : 'Something went wrong';
}

export function notifyError(error: unknown): void {
  notifications.show({
    color: 'red',
    title: errorTitle(error),
    message: error instanceof Error ? error.message : String(error),
  });
}

export function notifySuccess(message: string): void {
  notifications.show({ color: 'teal', message });
}
