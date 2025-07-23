import { DataGrid } from '@/components/data-grid';
import { ColumnDef } from '@tanstack/react-table';

interface SimpleUser {
  id: number;
  name: string;
  email: string;
}

const simpleData: SimpleUser[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

const simpleColumns: ColumnDef<SimpleUser>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

export default function SimpleDataGridTest() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Simple DataGrid Test</h1>
      <DataGrid
        rows={simpleData}
        columns={simpleColumns}
      />
    </div>
  );
}
