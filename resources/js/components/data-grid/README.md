# DataGrid Component

A comprehensive, feature-rich data grid component built with React and TanStack Table.

## Features

- ✅ **Sorting**: Multi-column sorting with visual indicators
- ✅ **Filtering**: Multiple filter types (input, select, checkbox, radio, slider, timerange)
- ✅ **Pagination**: Client-side and server-side pagination
- ✅ **Row Selection**: Single and multi-row selection
- ✅ **Column Visibility**: Show/hide columns
- ✅ **Global Search**: Search across all columns
- ✅ **Actions**: Row-level and bulk actions
- ✅ **Loading States**: Built-in loading indicators
- ✅ **Responsive**: Mobile-friendly design
- ✅ **TypeScript**: Full type safety
- ✅ **Async Search**: Support for async filter options

## Basic Usage

```tsx
import { DataGrid } from '@/components/data-grid';
import { ColumnDef } from '@tanstack/react-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

export function UsersTable() {
  return (
    <DataGrid
      rows={users}
      columns={columns}
      enableRowSelection={true}
    />
  );
}
```

## Advanced Usage with Filters

```tsx
import { DataGrid, DataGridFilterField } from '@/components/data-grid';

const filterFields: DataGridFilterField<User>[] = [
  {
    type: 'input',
    label: 'Name',
    value: 'name',
  },
  {
    type: 'select',
    label: 'Role',
    value: 'role',
    multiple: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Guest', value: 'guest' },
    ],
  },
  {
    type: 'radio',
    label: 'Status',
    value: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    type: 'checkbox',
    label: 'Permissions',
    value: 'permissions',
    options: [
      { label: 'Read', value: 'read' },
      { label: 'Write', value: 'write' },
      { label: 'Delete', value: 'delete' },
    ],
  },
  {
    type: 'slider',
    label: 'Age',
    value: 'age',
    min: 18,
    max: 65,
  },
  {
    type: 'timerange',
    label: 'Created Date',
    value: 'createdAt',
  },
];

export function AdvancedUsersTable() {
  return (
    <DataGrid
      rows={users}
      columns={columns}
      filterFields={filterFields}
      enableRowSelection={true}
      actionsToolbar={[
        {
          name: 'Delete Selected',
          icon: <TrashIcon />,
          color: 'danger',
          event: () => console.log('Delete selected'),
        },
      ]}
    />
  );
}
```

## Server-Side Usage

```tsx
import { useState, useEffect } from 'react';
import { DataGrid, DataGridState } from '@/components/data-grid';

export function ServerSideTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableState, setTableState] = useState<DataGridState>({});
  const [rowCount, setRowCount] = useState(0);

  const fetchData = async (state: DataGridState) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const result = await response.json();
      setData(result.data);
      setRowCount(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tableState);
  }, [tableState]);

  return (
    <DataGrid
      rows={data}
      columns={columns}
      tableState={tableState}
      serverSide={true}
      rowCount={rowCount}
      isLoading={loading}
      onPaginationChange={(pagination) => 
        setTableState(prev => ({ ...prev, pagination }))
      }
      onSortingChange={(sorting) => 
        setTableState(prev => ({ ...prev, sorting }))
      }
      onColumnFiltersChange={(columnFilters) => 
        setTableState(prev => ({ ...prev, columnFilters }))
      }
      onGlobalFilterChange={(globalFilter) => 
        setTableState(prev => ({ ...prev, globalFilter }))
      }
    />
  );
}
```

## Async Filter Options

```tsx
const filterFields: DataGridFilterField<User>[] = [
  {
    type: 'select',
    label: 'Department',
    value: 'departmentId',
    multiple: true,
    onSearch: async (searchValue: string) => {
      const response = await fetch(`/api/departments?search=${searchValue}`);
      const departments = await response.json();
      return departments.map(dept => ({
        label: dept.name,
        value: dept.id,
        // All additional properties are preserved
        description: dept.description,
        manager: dept.manager,
        location: dept.location,
      }));
    },
  },
];
```

## Props

### DataGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `TData[]` | `[]` | Array of data objects |
| `columns` | `ColumnDef<TData>[]` | `[]` | Column definitions |
| `initialTableState` | `DataGridState` | `{}` | Initial table state |
| `tableState` | `DataGridState` | - | Controlled table state |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Available page sizes |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `serverSide` | `boolean` | `false` | Enable server-side operations |
| `rowCount` | `number` | - | Total row count (server-side) |
| `isLoading` | `boolean` | `false` | Loading state |
| `emptyText` | `string` | `'No data available'` | Empty state text |
| `filterFields` | `DataGridFilterField<TData>[]` | `[]` | Filter field definitions |
| `actionsToolbar` | `ActionToolbarItem[]` | - | Bulk action buttons |
| `actionsRow` | `(row: TData) => ActionsRow<TData>[]` | - | Row-level actions |
| `className` | `string` | `''` | Additional CSS classes |
| `debounceDelay` | `number` | `300` | Debounce delay for filters |

### Filter Field Types

#### Input Filter
```tsx
{
  type: 'input',
  label: 'Field Label',
  value: 'fieldKey',
}
```

#### Select Filter
```tsx
{
  type: 'select',
  label: 'Field Label',
  value: 'fieldKey',
  multiple: true, // Optional
  options: [
    { label: 'Option 1', value: 'value1' },
    { label: 'Option 2', value: 'value2' },
  ],
  onSearch: async (searchValue) => {
    // Return array of options with all properties preserved
    return searchResults;
  },
}
```

#### Radio Filter
```tsx
{
  type: 'radio',
  label: 'Field Label',
  value: 'fieldKey',
  options: [
    { label: 'Option 1', value: 'value1' },
    { label: 'Option 2', value: 'value2' },
  ],
}
```

#### Checkbox Filter
```tsx
{
  type: 'checkbox',
  label: 'Field Label',
  value: 'fieldKey',
  options: [
    { label: 'Option 1', value: 'value1' },
    { label: 'Option 2', value: 'value2' },
  ],
}
```

#### Slider Filter
```tsx
{
  type: 'slider',
  label: 'Field Label',
  value: 'fieldKey',
  min: 0,
  max: 100,
}
```

#### Timerange Filter
```tsx
{
  type: 'timerange',
  label: 'Field Label',
  value: 'fieldKey',
}
```

## Architecture

The DataGrid component follows a provider pattern for state management:

- **DataGridProvider**: Centralized state management
- **useDataGrid**: Hook to access grid context
- **Modular Components**: Each part is a separate component
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized with useMemo and useCallback

## Customization

All components can be customized by extending the base components or using the provider pattern to access the table instance directly.

```tsx
import { useDataGrid } from '@/components/data-grid';

function CustomComponent() {
  const { table, isLoading, hasActiveFilters } = useDataGrid();
  
  // Custom logic here
  
  return <div>Custom content</div>;
}
