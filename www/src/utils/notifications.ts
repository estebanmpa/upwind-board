import { notifications } from '@mantine/notifications';
import { ApiError } from '@/api/http';

const STATUS_TITLES: Record<number, string> = {
  0: 'Sin conexión',
  400: 'Datos inválidos',
  404: 'No encontrado',
  409: 'No se puede completar la operación',
};

function errorTitle(error: unknown): string {
  return error instanceof ApiError
    ? (STATUS_TITLES[error.status] ?? 'Error del servidor')
    : 'Algo salió mal';
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
