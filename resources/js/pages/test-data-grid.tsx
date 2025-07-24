import { DataGrid, DataGridFilterField, DataGridState } from '@/components/data-grid';
import { Option } from '@/components/multiple-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, UserPlus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
    assignedUsers?: string[];
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
        createdAt: new Date(2023, i % 12, (i % 28) + 1),
        permissions: permissions.slice(0, (i % 3) + 1),
        salary: 50000 + i * 1000,
        assignedUsers: i % 3 === 0 ? ['John Doe', 'Jane Smith'] : i % 2 === 0 ? ['Bob Wilson'] : undefined,
    }));
};

const testData = generateTestData(100);

// Column definitions
const columns: ColumnDef<TestUser>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
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
            return <Badge variant={role === 'admin' ? 'fill' : 'outline'}>{role}</Badge>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <Badge variant={status === 'active' ? 'fill' : 'outline'}>{status}</Badge>;
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
        accessorKey: 'assignedUsers',
        header: 'Assigned Users',
        cell: ({ row }) => {
            const users = row.getValue('assignedUsers') as string[] | undefined;
            if (!users || users.length === 0) {
                return <span className="text-muted-foreground">None</span>;
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {users.map((user, index) => (
                        <Badge key={index} variant="outline" size="sm">
                            {user}
                        </Badge>
                    ))}
                </div>
            );
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

// Simulate async department search with custom content
const searchDepartments = async (searchValue: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const departments = [
        {
            id: 1,
            name: 'Engineering',
            description: 'Software Development',
            manager: 'John Smith',
            location: 'Building A',
            color: 'bg-blue-500',
            icon: '💻',
        },
        {
            id: 2,
            name: 'Marketing',
            description: 'Product Marketing',
            manager: 'Jane Doe',
            location: 'Building B',
            color: 'bg-green-500',
            icon: '📈',
        },
        {
            id: 3,
            name: 'Sales',
            description: 'Business Development',
            manager: 'Bob Wilson',
            location: 'Building C',
            color: 'bg-purple-500',
            icon: '💼',
        },
        { id: 4, name: 'HR', description: 'Human Resources', manager: 'Alice Brown', location: 'Building D', color: 'bg-orange-500', icon: '👥' },
        {
            id: 5,
            name: 'Finance',
            description: 'Financial Operations',
            manager: 'Charlie Davis',
            location: 'Building E',
            color: 'bg-red-500',
            icon: '💰',
        },
    ];

    return departments
        .filter(
            (dept) =>
                dept.name.toLowerCase().includes(searchValue.toLowerCase()) || dept.description.toLowerCase().includes(searchValue.toLowerCase()),
        )
        .map((dept) => ({
            label: dept.name,
            value: dept.name,
            description: dept.description,
            manager: dept.manager,
            location: dept.location,
            color: dept.color,
            icon: dept.icon,
            // Custom option content with icon and details
            optionContent: () => (
                <div className="flex items-center gap-3 py-1">
                    <div className={`h-8 w-8 ${dept.color} flex items-center justify-center rounded-full text-sm text-white`}>{dept.icon}</div>
                    <div className="flex-1">
                        <div className="text-sm font-medium">{dept.name}</div>
                        <div className="text-xs text-muted-foreground">{dept.description}</div>
                        <div className="text-xs text-muted-foreground">
                            Manager: {dept.manager} • {dept.location}
                        </div>
                    </div>
                </div>
            ),
            // Custom badge content with icon
            badgeContent: () => (
                <div className="flex items-center gap-1">
                    <span>{dept.icon}</span>
                    <span>{dept.name}</span>
                </div>
            ),
        }));
};

// Simulate async user search with avatars
const searchUsers = async (searchValue: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'JD', status: 'online' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', avatar: 'JS', status: 'offline' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Developer', avatar: 'BW', status: 'online' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Designer', avatar: 'AB', status: 'busy' },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Analyst', avatar: 'CD', status: 'online' },
    ];

    return users
        .filter(
            (user) =>
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.role.toLowerCase().includes(searchValue.toLowerCase()),
        )
        .map((user) => ({
            label: user.name,
            value: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status,
            // Custom option content with avatar
            optionContent: () => (
                <div className="flex items-center gap-3 py-1">
                    <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                            {user.avatar}
                        </div>
                        <div
                            className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' : user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                                }`}
                        ></div>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-blue-600">{user.role}</div>
                    </div>
                </div>
            ),
            // Custom badge element - completely custom badge
            badgeElement: ({ onRemove, disabled, fixed }: { option: Option; onRemove: () => void; disabled?: boolean; fixed?: boolean }) => (
                <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-2 py-1 text-sm">
                    <div className="relative">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                            {user.avatar}
                        </div>
                        <div
                            className={`absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white ${user.status === 'online' ? 'bg-green-500' : user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                                }`}
                        ></div>
                    </div>
                    <span className="text-gray-700">{user.name}</span>
                    {!disabled && !fixed && (
                        <button onClick={onRemove} className="ml-1 rounded-full p-0.5 transition-colors hover:bg-red-100">
                            <X className="h-3 w-3 text-red-500" />
                        </button>
                    )}
                </div>
            ),
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
        label: 'Department (Custom UI)',
        value: 'department',
        multiple: true,
        onSearch: searchDepartments,
    },
    {
        type: 'select',
        label: 'Assigned Users (Custom Badges)',
        value: 'assignedUsers',
        multiple: true,
        onSearch: searchUsers,
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
        setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    }, []);

    // Simulate server-side data fetching
    const fetchServerSideData = useCallback(
        async (state: DataGridState) => {
            setLoading(true);

            // Add test result
            addTestResult(`Server-side fetch called`);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            let filteredData = [...testData];

            // Apply global filter
            if (state.globalFilter) {
                filteredData = filteredData.filter((user) =>
                    Object.values(user).some((value) => String(value).toLowerCase().includes(state.globalFilter!.toLowerCase())),
                );
            }

            // Apply column filters
            if (state.columnFilters) {
                state.columnFilters.forEach((filter: any) => {
                    filteredData = filteredData.filter((user) => {
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

                    // Handle undefined values
                    if (aValue === undefined && bValue === undefined) return 0;
                    if (aValue === undefined) return sort.desc ? 1 : -1;
                    if (bValue === undefined) return sort.desc ? -1 : 1;

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
        },
        [addTestResult],
    );

    // Stable callback functions for DataGrid
    const handleClientPaginationChange = useCallback(
        (pagination: any) => {
            addTestResult(`Client pagination changed: page ${pagination.pageIndex + 1}, size ${pagination.pageSize}`);
        },
        [addTestResult],
    );

    const handleClientSortingChange = useCallback(
        (sorting: any) => {
            addTestResult(`Client sorting changed: ${JSON.stringify(sorting)}`);
        },
        [addTestResult],
    );

    const handleClientColumnFiltersChange = useCallback(
        (filters: any) => {
            console.log('Client filters changed:', filters);
            addTestResult(`Client filters changed: ${filters.length} active`);
        },
        [addTestResult],
    );

    const handleClientGlobalFilterChange = useCallback(
        (filter: string) => {
            addTestResult(`Client global filter: "${filter}"`);
        },
        [addTestResult],
    );

    const handleClientSelectionChange = useCallback(
        (selection: any) => {
            addTestResult(`Client selection changed: ${Object.keys(selection).length} selected`);
        },
        [addTestResult],
    );

    // Server-side callbacks
    const handleServerPaginationChange = useCallback(
        (pagination: any) => {
            addTestResult(`Server pagination changed: page ${pagination.pageIndex + 1}, size ${pagination.pageSize}`);
            setTableState((prev: any) => ({ ...prev, pagination }));
        },
        [addTestResult],
    );

    const handleServerSortingChange = useCallback(
        (sorting: any) => {
            addTestResult(`Server sorting changed: ${JSON.stringify(sorting)}`);
            setTableState((prev: any) => ({ ...prev, sorting }));
        },
        [addTestResult],
    );

    const handleServerColumnFiltersChange = useCallback(
        (columnFilters: any) => {
            addTestResult(`Server filters changed: ${columnFilters.length} active`);
            setTableState((prev: any) => ({ ...prev, columnFilters }));
        },
        [addTestResult],
    );

    const handleServerGlobalFilterChange = useCallback(
        (globalFilter: string) => {
            addTestResult(`Server global filter: "${globalFilter}"`);
            setTableState((prev: any) => ({ ...prev, globalFilter }));
        },
        [addTestResult],
    );

    useEffect(() => {
        fetchServerSideData(tableState);
    }, [tableState, fetchServerSideData]);

    return (
        <div className="container mx-auto space-y-8 p-6">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">DataGrid Comprehensive Testing</h1>
                <p className="text-muted-foreground">
                    This page tests all DataGrid features including filters, sorting, pagination, row selection, and server-side operations.
                </p>
            </div>

            {/* Test Results Panel */}
            <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Test Results Log</h3>
                <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
                    {testResults.map((result, index) => (
                        <div key={index} className="font-mono text-xs">
                            {result}
                        </div>
                    ))}
                </div>
                <Button size="sm" variant="outline" onClick={() => setTestResults([])} className="mt-2">
                    Clear Log
                </Button>
            </div>

            {/* Client-side DataGrid */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Client-side DataGrid</h2>
                <p className="text-sm text-muted-foreground">Tests all filter types, row selection, and client-side operations with 100 records.</p>
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
                <p className="text-sm text-muted-foreground">Tests server-side operations, loading states, and controlled state management.</p>
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

            {/* Custom Multiple Selector Features */}
            <div className="rounded-lg bg-green-50 p-4">
                <h3 className="mb-2 font-semibold">🎨 Custom Multiple Selector Features</h3>
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>New Customization Options:</strong>
                    </p>
                    <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>
                            <strong>optionContent:</strong> Custom JSX for dropdown options (see Department filter with icons & descriptions)
                        </li>
                        <li>
                            <strong>badgeContent:</strong> Custom JSX for badge content while keeping default badge styling
                        </li>
                        <li>
                            <strong>badgeElement:</strong> Complete custom badge replacement (see Assigned Users with avatars & status)
                        </li>
                    </ul>

                    <p className="mt-3">
                        <strong>Try These Examples:</strong>
                    </p>
                    <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>
                            🏢 <strong>Department Filter:</strong> Shows department icons, descriptions, manager info
                        </li>
                        <li>
                            👥 <strong>Assigned Users Filter:</strong> Shows user avatars, online status, custom gradient badges
                        </li>
                    </ul>
                </div>
            </div>

            {/* Testing Instructions */}
            <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold">Testing Instructions</h3>
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>1. Filter Testing:</strong>
                    </p>
                    <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>Test input filter with name search</li>
                        <li>Test multi-select role filter</li>
                        <li>Test async department search with custom UI (icons, descriptions)</li>
                        <li>Test assigned users filter with custom badges and avatars</li>
                        <li>Test radio status filter</li>
                        <li>Test checkbox permissions filter</li>
                        <li>Test age and salary sliders</li>
                        <li>Test date range picker</li>
                        <li>Test "Clear All" filters button</li>
                    </ul>

                    <p>
                        <strong>2. Interaction Testing:</strong>
                    </p>
                    <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>Test column sorting (click headers)</li>
                        <li>Test pagination controls</li>
                        <li>Test page size changes</li>
                        <li>Test row selection (checkboxes)</li>
                        <li>Test bulk actions (select rows first)</li>
                        <li>Test row actions (hover over rows)</li>
                        <li>Test global search</li>
                        <li>Test column visibility (Views dropdown)</li>
                    </ul>

                    <p>
                        <strong>3. Performance Testing:</strong>
                    </p>
                    <ul className="ml-4 list-inside list-disc space-y-1">
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
