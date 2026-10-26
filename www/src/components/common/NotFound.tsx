import { Button } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { EmptyState } from './EmptyState';

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The content you are looking for does not exist or was deleted."
      action={
        <Button component={Link} to="/" mt="md">
          Back to dashboard
        </Button>
      }
    />
  );
}
