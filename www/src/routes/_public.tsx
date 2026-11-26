import { Center } from '@mantine/core';
import { Outlet, createFileRoute } from '@tanstack/react-router';

/** Pages reachable without a session: a single centered card. */
export const Route = createFileRoute('/_public')({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <Center mih="100vh" p="md">
      <Outlet />
    </Center>
  );
}
