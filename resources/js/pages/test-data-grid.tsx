import { useState, useEffect, useCallback } from 'react';
import { DataGrid, DataGridFilterField, DataGridState } from '@/components/data-grid';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, Eye } from 'lucide-react';

// Test data type
interface TestUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    status: 'active' | 'inactive';
    age: number;
    department: string;
    createdAt: Date;
    permissions: string[];
    salary: number;
}

// Generate test data
const generateTestData = (count: number): TestUser[] => {
    const roles = ['admin', 'user', 'guest'] as const;
    const statuses = ['active', 'inactive'] as const;
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    const permissions = ['read', 'write', 'delete'];

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % roles.length],
        status: statuses[i % statuses.length],
        age: 20 + (i % 45),
        department: departments[i % departments.length],
        createdAt: new Date(2023, (i % 12), (i % 28) + 1),
        permissions: permissions.slice(0, (i % 3) + 1),
        salary: 50000 + (i * 1000),
    }));
};

const testData = generateTestData(100);

// Column definitions
const columns: ColumnDef<TestUser>[] = [
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
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => {
            const salary = row.getValue('salary') as number;
            return `$${salary.toLocaleString()}`;
        },
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => {
            const permissions = row.getValue('permissions') as string[];
            return permissions.join(', ');
        },
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

// Simulate async department search
const searchDepartments = async (searchValue: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const departments = [
        { id: 1, name: 'Engineering', description: 'Software Development', manager: 'John Smith', location: 'Building A' },
        { id: 2, name: 'Marketing', description: 'Product Marketing', manager: 'Jane Doe', location: 'Building B' },
        { id: 3, name: 'Sales', description: 'Business Development', manager: 'Bob Wilson', location: 'Building C' },
        { id: 4, name: 'HR', description: 'Human Resources', manager: 'Alice Brown', location: 'Building D' },
        { id: 5, name: 'Finance', description: 'Financial Operations', manager: 'Charlie Davis', location: 'Building E' },
    ];

    return departments
        .filter(dept =>
            dept.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            dept.description.toLowerCase().includes(searchValue.toLowerCase())
        )
        .map(dept => ({
            label: dept.name,
            value: dept.name,
            description: dept.description,
            manager: dept.manager,
            location: dept.location,
        }));
};

// Filter field definitions for comprehensive testing
const filterFields: DataGridFilterField<TestUser>[] = [
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
        type: 'select',
        label: 'Department (Async)',
        value: 'department',
        multiple: true,
        onSearch: searchDepartments,
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
        type: 'slider',
        label: 'Salary Range',
        value: 'salary',
        min: 50000,
        max: 150000,
    },
    {
        type: 'timerange',
        label: 'Created Date',
        value: 'createdAt',
    },
];

export default function TestDataGrid() {
    const [serverSideData, setServerSideData] = useState<TestUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [tableState, setTableState] = useState<DataGridState>({});
    const [rowCount, setRowCount] = useState(0);
    const [testResults, setTestResults] = useState<string[]>([]);

    // Stable callback functions
    const addTestResult = useCallback((result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    }, []);

    // Simulate server-side data fetching
    const fetchServerSideData = useCallback(async (state: DataGridState) => {
        setLoading(true);

        // Add test result
        addTestResult(`Server-side fetch called`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        let filteredData = [...testData];

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
                    const value = user[filter.id as keyof TestUser];
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
                const aValue = a[sort.id as keyof TestUser];
                const bValue = b[sort.id as keyof TestUser];

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

        setServerSideData(paginatedData);
        setRowCount(total);
        setLoading(false);

        addTestResult(`Server-side data loaded: ${paginatedData.length} items of ${total} total`);
    }, [addTestResult]);

    // Stable callback functions for DataGrid
    const handleClientPaginationChange = useCallback((pagination: any) => {
        addTestResult(`Client pagination changed: page ${pagination.pageIndex + 1}, size ${pagination.pageSize}`);
    }, [addTestResult]);

    const handleClientSortingChange = useCallback((sorting: any) => {
        addTestResult(`Client sorting changed: ${JSON.stringify(sorting)}`);
    }, [addTestResult]);

    const handleClientColumnFiltersChange = useCallback((filters: any) => {
        addTestResult(`Client filters changed: ${filters.length} active`);
    }, [addTestResult]);

    const handleClientGlobalFilterChange = useCallback((filter: string) => {
        addTestResult(`Client global filter: "${filter}"`);
    }, [addTestResult]);

    const handleClientSelectionChange = useCallback((selection: any) => {
        addTestResult(`Client selection changed: ${Object.keys(selection).length} selected`);
    }, [addTestResult]);

    // Server-side callbacks
    const handleServerPaginationChange = useCallback((pagination: any) => {
        addTestResult(`Server pagination changed: page ${pagination.pageIndex + 1}, size ${pagination.pageSize}`);
        setTableState((prev: any) => ({ ...prev, pagination }));
    }, [addTestResult]);

    const handleServerSortingChange = useCallback((sorting: any) => {
        addTestResult(`Server sorting changed: ${JSON.stringify(sorting)}`);
        setTableState((prev: any) => ({ ...prev, sorting }));
    }, [addTestResult]);

    const handleServerColumnFiltersChange = useCallback((columnFilters: any) => {
        addTestResult(`Server filters changed: ${columnFilters.length} active`);
        setTableState((prev: any) => ({ ...prev, columnFilters }));
    }, [addTestResult]);

    const handleServerGlobalFilterChange = useCallback((globalFilter: string) => {
        addTestResult(`Server global filter: "${globalFilter}"`);
        setTableState((prev: any) => ({ ...prev, globalFilter }));
    }, [addTestResult]);

    useEffect(() => {
        fetchServerSideData(tableState);
    }, [tableState, fetchServerSideData]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">DataGrid Comprehensive Testing</h1>
                <p className="text-muted-foreground">
                    This page tests all DataGrid features including filters, sorting, pagination, row selection, and server-side operations.
                </p>
            </div>

            {/* Test Results Panel */}
            <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Results Log</h3>
                <div className="max-h-32 overflow-y-auto text-sm space-y-1">
                    {testResults.map((result, index) => (
                        <div key={index} className="text-xs font-mono">
                            {result}
                        </div>
                    ))}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTestResults([])}
                    className="mt-2"
                >
                    Clear Log
                </Button>
            </div>

            {/* Client-side DataGrid */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Client-side DataGrid</h2>
                <p className="text-sm text-muted-foreground">
                    Tests all filter types, row selection, and client-side operations with 100 records.
                </p>
                <DataGrid
                    rows={testData}
                    columns={columns}
                    enableRowSelection={true}
                    filterFields={filterFields}
                    pageSizeOptions={[5, 10, 25, 50]}
                    actionsToolbar={[
                        {
                            name: 'Add User',
                            icon: <UserPlus className="h-4 w-4" />,
                            color: 'primary',
                            event: () => addTestResult('Add User action clicked'),
                        },
                        {
                            name: 'Delete Selected',
                            icon: <Trash2 className="h-4 w-4" />,
                            color: 'danger',
                            event: () => addTestResult('Delete Selected action clicked'),
                        },
                    ]}
                    actionsRow={(row) => [
                        {
                            name: 'View',
                            event: () => addTestResult(`View user: ${row.name}`),
                            color: 'secondary',
                        },
                        {
                            name: 'Edit',
                            event: () => addTestResult(`Edit user: ${row.name}`),
                            color: 'primary',
                        },
                        {
                            name: 'Delete',
                            event: () => addTestResult(`Delete user: ${row.name}`),
                            color: 'danger',
                        },
                    ]}
                    onPaginationChange={handleClientPaginationChange}
                    onSortingChange={handleClientSortingChange}
                    onColumnFiltersChange={handleClientColumnFiltersChange}
                    onGlobalFilterChange={handleClientGlobalFilterChange}
                    onSelectionChange={handleClientSelectionChange}
                />
            </div>

            {/* Server-side DataGrid */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Server-side DataGrid</h2>
                <p className="text-sm text-muted-foreground">
                    Tests server-side operations, loading states, and controlled state management.
                </p>
                <DataGrid
                    rows={serverSideData}
                    columns={columns}
                    tableState={tableState}
                    serverSide={true}
                    rowCount={rowCount}
                    isLoading={loading}
                    enableRowSelection={true}
                filterFields={filterFields.slice(0, 4)} // Limit filters for server-side
                pageSizeOptions={[5, 10, 25]}
                actionsToolbar={[
                    {
                        name: 'Add User',
                        icon: <UserPlus className="h-4 w-4" />,
                        color: 'primary',
                        event: () => addTestResult('Add User action clicked (server-side)'),
                    },
                    {
                        name: 'Delete Selected',
                        icon: <Trash2 className="h-4 w-4" />,
                        color: 'danger',
                        event: () => addTestResult('Delete Selected action clicked (server-side)'),
                    },
                ]}
                onPaginationChange={handleServerPaginationChange}
                onSortingChange={handleServerSortingChange}
                onColumnFiltersChange={handleServerColumnFiltersChange}
                onGlobalFilterChange={handleServerGlobalFilterChange}
            />

            </div>

            {/* Testing Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Testing Instructions</h3>
                <div className="text-sm space-y-2">
                    <p><strong>1. Filter Testing:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Test input filter with name search</li>
                        <li>Test multi-select role filter</li>
                        <li>Test async department search (type to search)</li>
                        <li>Test radio status filter</li>
                        <li>Test checkbox permissions filter</li>
                        <li>Test age and salary sliders</li>
                        <li>Test date range picker</li>
                        <li>Test "Clear All" filters button</li>
                    </ul>

                    <p><strong>2. Interaction Testing:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Test column sorting (click headers)</li>
                        <li>Test pagination controls</li>
                        <li>Test page size changes</li>
                        <li>Test row selection (checkboxes)</li>
                        <li>Test bulk actions (select rows first)</li>
                        <li>Test row actions (hover over rows)</li>
                        <li>Test global search</li>
                        <li>Test column visibility (Views dropdown)</li>
                    </ul>

                    <p><strong>3. Performance Testing:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Apply multiple filters simultaneously</li>
                        <li>Test with large page sizes (50 items)</li>
                        <li>Test rapid filter changes</li>
                        <li>Test server-side loading states</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
