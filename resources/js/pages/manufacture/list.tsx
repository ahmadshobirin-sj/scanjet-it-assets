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
import { Manufacture } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const ManufactureListPage = () => {
    const {
        props: { manufactures },
        component,
    } = usePage<SharedData & { manufactures: DataTableResource<Manufacture> }>();
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();

    const handleView = (row: Manufacture) => {
        router.visit(route('manufacture.show', { manufacture: row.id }));
    };

    const handleEdit = (row: Manufacture) => {
        router.visit(route('manufacture.edit', { manufacture: row.id }));
    };

    const handleDelete = (row: Manufacture) => {
        confirmDialog({
            title: 'Delete manufacture',
            description: (
                <>
                    Are you sure you want to delete manufacture <b>{row.name}</b> This action cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('manufacture.destroy', row.id), {
                    preserveScroll: true,
                    preserveState: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Manufactures"
                    subtitle="List of all manufactures"
                    actions={
                        <>
                            {can('manufacture.create') && (
                                <Button leading={<Plus />} onClick={() => router.visit(route('manufacture.create'))}>
                                    Create manufacture
                                </Button>
                            )}
                        </>
                    }
                />
                <DataTable
                    resource={manufactures}
                    transformerColumns={{
                        created_at: (column) => ({
                            ...column,
                            cell: ({ row }) => formatWithBrowserTimezone(row.original.created_at),
                        }),
                    }}
                    bulkActions={[]}
                    exportActions={[]}
                    actionsRow={() => [
                        ...(can('manufacture.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('manufacture.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('manufacture.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ]}
                />
            </AppContainer>
        </AppLayout>
    );
};

export default ManufactureListPage;
