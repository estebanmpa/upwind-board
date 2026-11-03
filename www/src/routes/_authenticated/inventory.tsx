import { createFileRoute } from '@tanstack/react-router';
import { InventoryPage } from '@/pages/inventory/InventoryPage';

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryPage,
});
