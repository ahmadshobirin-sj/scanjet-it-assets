import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataTable, DataTableResource } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { formatWithBrowserTimezone } from '@/lib/date';
import { SharedData } from '@/types';
import { Role } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const RoleListPage = () => {
    const {
        props: { roles },
        component,
    } = usePage<SharedData & { roles: DataTableResource<Role> }>();
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();

    const handleView = (row: Role) => {
        router.visit(route('role.show', { role: row.id }));
    };

    const handleEdit = (row: Role) => {
        router.visit(route('role.edit', { role: row.id }));
    };

    const handleDelete = (row: Role) => {
        confirmDialog({
            title: 'Delete role',
            description: (
                <>
                    Are you sure you want to delete role <b>{row.name}</b> This action cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('role.destroy', row.id), {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Roles"
                    subtitle="List of roles in the system"
                    actions={
                        <>
                            {can('role.create') && (
                                <Button leading={<Plus />} variant="fill" onClick={() => router.visit(route('role.create'))}>
                                    New Role
                                </Button>
                            )}
                        </>
                    }
                />
                <DataTable
                    resource={roles}
                    bulkActions={[]}
                    exportActions={[]}
                    actionsRow={() => [
                        ...(can('role.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('role.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('role.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ]}
                    transformerColumns={{
                        created_at: (columns) => ({
                            ...columns,
                            cell: ({ row }) => {
                                return formatWithBrowserTimezone(row.original.created_at);
                            },
                        }),
                    }}
                />
            </AppContainer>
        </AppLayout>
    );
};

export default RoleListPage;
