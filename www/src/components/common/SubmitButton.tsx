import { Button } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';

export function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
  return (
    <Button
      type="submit"
      size="md"
      variant="gradient"
      loading={loading}
      leftSection={<IconDeviceFloppy size={18} />}
    >
      {label}
    </Button>
  );
}
