import { Button } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { EmptyState } from './EmptyState';

export function NotFound() {
  return (
    <EmptyState
      title="Página no encontrada"
      description="El contenido que buscás no existe o fue eliminado."
      action={
        <Button component={Link} to="/" mt="md">
          Volver al resumen
        </Button>
      }
    />
  );
}
