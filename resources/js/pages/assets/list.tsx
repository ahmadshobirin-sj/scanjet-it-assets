import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataTable, DataTableResource } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { SharedData } from '@/types';
import { Asset } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { columns } from './column';

const AssetListPage = () => {
    const { can } = usePermission();
    const {
        component,
        props: { assets },
    } = usePage<SharedData & { assets: DataTableResource<Asset> }>();
    const breadcrumbs = useBreadcrumb(component);

    const handleView = (row: Asset) => {
        router.visit(route('asset.show', { id: row.id }));
    };

    const handleEdit = (row: Asset) => {
        router.visit(route('asset.edit', { id: row.id }));
    };

    const handleDelete = (row: Asset) => {
        confirmDialog({
            title: 'Delete asset',
            description: (
                <>
                    Are you sure you want to delete asset <b>{row.name}</b> This action cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('asset.destroy', row.id), {
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
                    title="Assets"
                    subtitle="Manage your assets"
                    actions={
                        <>
                            <Button leading={<Plus />} onClick={() => router.visit(route('asset.create'))}>
                                Create asset
                            </Button>
                        </>
                    }
                />
                <DataTable
                    resource={assets}
                    actionsRow={() => [
                        ...(can('asset.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('asset.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('asset.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ]}
                    bulkActions={[]}
                    exportActions={[]}
                    transformerColumns={columns}
                />
            </AppContainer>
        </AppLayout>
    );
};

export default AssetListPage;
