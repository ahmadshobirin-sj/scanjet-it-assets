import { DataTable, DataTableResource } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { formatWithBrowserTimezone } from '@/lib/date';
import { UserRoleStyle } from '@/lib/userRoleStyle';
import { SharedData } from '@/types';
import { User } from '@/types/model';
import { usePage } from '@inertiajs/react';

const DataTablePage = () => {
    const { props } = usePage<SharedData & { users: DataTableResource<User> }>();

    return (
        <div className="mx-auto max-w-7xl py-6">
            <DataTable
                resource={props.users}
                actionsRow={() => [
                    {
                        name: 'Edit',
                        event: (row) => console.log('Edit user', row),
                        color: 'primary',
                    },
                ]}
                exportActions={[
                    {
                        name: 'PDF',
                    },
                ]}
                bulkActions={[
                    {
                        name: 'Test',
                        color: 'destructive',
                    },
                ]}
                transformerColumns={{
                    'roles.name': (column) => ({
                        ...column,
                        cell: ({ row }) => {
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {row.original.roles.map((role) => (
                                        <Badge
                                            key={role.id}
                                            intent={UserRoleStyle.getIntent(role.name) as any}
                                            variant="fill"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            );
                        },
                    }),
                    created_at: (column) => ({
                        ...column,
                        cell: ({ row }) => {
                            return formatWithBrowserTimezone(row.original.created_at);
                        },
                    }),
                    updated_at: (column) => ({
                        ...column,
                        cell: ({ row }) => {
                            return formatWithBrowserTimezone(row.original.updated_at);
                        },
                    }),
                }}
            />

            <div className="relative mt-6 overflow-hidden rounded-md border">
                <div className="bg-gray-100 p-3">
                    <pre>{JSON.stringify(props.debug, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default DataTablePage;
