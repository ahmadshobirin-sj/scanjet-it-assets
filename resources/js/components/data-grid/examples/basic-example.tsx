import { useState, useEffect } from 'react';
import { DataGrid, DataGridFilterField, DataGridState } from '../index';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus } from 'lucide-react';

// Example data type
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    status: 'active' | 'inactive';
    age: number;
    department: string;
    createdAt: Date;
    permissions: string[];
}

// Sample data
const sampleUsers: User[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        age: 32,
        department: 'Engineering',
        createdAt: new Date('2023-01-15'),
        permissions: ['read', 'write', 'delete'],
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        age: 28,
        department: 'Marketing',
        createdAt: new Date('2023-02-20'),
        permissions: ['read', 'write'],
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'guest',
        status: 'inactive',
        age: 45,
        department: 'Sales',
        createdAt: new Date('2023-03-10'),
        permissions: ['read'],
    },
];

// Column definitions
const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as string;
            return (
                <Badge variant={role === 'admin' ? 'fill' : 'outline'}>
                    {role}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant={status === 'active' ? 'fill' : 'outline'}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'age',
        header: 'Age',
    },
    {
        accessorKey: 'department',
        header: 'Department',
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as Date;
            return date.toLocaleDateString();
        },
    },
];

// Filter field definitions
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
        label: 'Age Range',
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

// Basic Example
export function BasicDataGridExample() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Basic DataGrid Example</h2>
            <DataGrid
                rows={sampleUsers}
                columns={columns}
                enableRowSelection={true}
                filterFields={filterFields}
                actionsToolbar={[
                    {
                        name: 'Add User',
                        icon: <UserPlus className="h-4 w-4" />,
                        color: 'primary',
                        event: () => console.log('Add user clicked'),
                    },
                    {
                        name: 'Delete Selected',
                        icon: <Trash2 className="h-4 w-4" />,
                        color: 'danger',
                        event: () => console.log('Delete selected clicked'),
                    },
                ]}
                actionsRow={(row) => [
                    {
                        name: 'Edit',
                        event: () => console.log('Edit user:', row.id),
                        color: 'primary',
                    },
                    {
                        name: 'Delete',
                        event: () => console.log('Delete user:', row.id),
                        color: 'danger',
                    },
                ]}
            />
        </div>
    );
}

// Server-side Example
export function ServerSideDataGridExample() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [tableState, setTableState] = useState<DataGridState>({});
    const [rowCount, setRowCount] = useState(0);

    // Simulate API call
    const fetchData = async (state: DataGridState) => {
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Apply filters, sorting, pagination
        let filteredData = [...sampleUsers];

        // Apply global filter
        if (state.globalFilter) {
            filteredData = filteredData.filter(user =>
                Object.values(user).some(value =>
                    String(value).toLowerCase().includes(state.globalFilter!.toLowerCase())
                )
            );
        }

        // Apply column filters
        if (state.columnFilters) {
            state.columnFilters.forEach((filter: any) => {
                filteredData = filteredData.filter(user => {
                    const value = user[filter.id as keyof User];
                    if (Array.isArray(filter.value)) {
                        return filter.value.includes(String(value));
                    }
                    return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                });
            });
        }

        // Apply sorting
        if (state.sorting && state.sorting.length > 0) {
            const sort = state.sorting[0];
            filteredData.sort((a, b) => {
                const aValue = a[sort.id as keyof User];
                const bValue = b[sort.id as keyof User];

                if (aValue < bValue) return sort.desc ? 1 : -1;
                if (aValue > bValue) return sort.desc ? -1 : 1;
                return 0;
            });
        }

        const total = filteredData.length;

        // Apply pagination
        const pageSize = state.pagination?.pageSize || 10;
        const pageIndex = state.pagination?.pageIndex || 0;
        const start = pageIndex * pageSize;
        const paginatedData = filteredData.slice(start, start + pageSize);

        setData(paginatedData);
        setRowCount(total);
        setLoading(false);
    };

    useEffect(() => {
        fetchData(tableState);
    }, [tableState]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Server-side DataGrid Example</h2>
            <DataGrid
                rows={data}
                columns={columns}
                tableState={tableState}
                serverSide={true}
                rowCount={rowCount}
                isLoading={loading}
                enableRowSelection={true}
                filterFields={filterFields}
                onPaginationChange={(pagination) =>
                    setTableState((prev: any) => ({ ...prev, pagination }))
                }
                onSortingChange={(sorting) =>
                    setTableState((prev: any) => ({ ...prev, sorting }))
                }
                onColumnFiltersChange={(columnFilters) =>
                    setTableState((prev: any) => ({ ...prev, columnFilters }))
                }
                onGlobalFilterChange={(globalFilter) =>
                    setTableState((prev: any) => ({ ...prev, globalFilter }))
                }
            />
        </div>
    );
}

// Async Filter Example
export function AsyncFilterDataGridExample() {
    // Simulate async department search
    const searchDepartments = async (searchValue: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const departments = [
            { id: 1, name: 'Engineering', description: 'Software Development', manager: 'John Smith' },
            { id: 2, name: 'Marketing', description: 'Product Marketing', manager: 'Jane Doe' },
            { id: 3, name: 'Sales', description: 'Business Development', manager: 'Bob Wilson' },
            { id: 4, name: 'HR', description: 'Human Resources', manager: 'Alice Brown' },
            { id: 5, name: 'Finance', description: 'Financial Operations', manager: 'Charlie Davis' },
        ];

        return departments
            .filter(dept =>
                dept.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                dept.description.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map(dept => ({
                label: dept.name,
                value: dept.id,
                // All additional properties are preserved for localStorage
                description: dept.description,
                manager: dept.manager,
            }));
    };

    const asyncFilterFields: DataGridFilterField<User>[] = [
        {
            type: 'input',
            label: 'Name',
            value: 'name',
        },
        {
            type: 'select',
            label: 'Department',
            value: 'department',
            multiple: true,
            onSearch: searchDepartments,
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Async Filter DataGrid Example</h2>
            <DataGrid
                rows={sampleUsers}
                columns={columns}
                enableRowSelection={true}
                filterFields={asyncFilterFields}
            />
        </div>
    );
}
