import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataTable, DataTableResource } from '@/components/data-table';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { formatWithBrowserTimezone } from '@/lib/date';
import { SharedData } from '@/types';
import { AssetCategory } from '@/types/model';
import { router } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import AssetCategoryCreatePage from './create';
import AssetCategoryDetailPage from './detail';
import AssetCategoryUpdatePage, { AssetCategoryUpdatePageRef } from './edit';

const AssetCategoryListPage = () => {
    const {
        props: { asset_categories },
        component,
    } = usePage<SharedData & { asset_categories: DataTableResource<AssetCategory> }>();
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();
    const assetCategoryUpdatePageRef = useRef<AssetCategoryUpdatePageRef>(null);
    const assetCategoryDetailPageRef = useRef<AssetCategoryUpdatePageRef>(null);
    const [assetCategorySelected, setAssetCategorySelected] = useState<AssetCategory | null>(null);

    const handleView = useCallback((row: AssetCategory) => {
        setAssetCategorySelected(row);
        assetCategoryDetailPageRef.current?.open();
    }, []);

    const handleEdit = useCallback((row: AssetCategory) => {
        setAssetCategorySelected(row);
        assetCategoryUpdatePageRef.current?.open();
    }, []);

    const handleDelete = (row: AssetCategory) => {
        confirmDialog({
            title: 'Delete asset category',
            description: (
                <>
                    Are you sure you want to delete <b>{row.name}</b> This action cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('asset_category.destroy', row.id), {
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
                    title="Asset categories"
                    subtitle="Manage your asset categories here."
                    actions={<>{can('asset_category.create') && <AssetCategoryCreatePage />}</>}
                />
                <DataTable
                    resource={asset_categories}
                    actionsRow={() => [
                        ...(can('asset_category.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('asset_category.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('asset_category.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ]}
                    bulkActions={[]}
                    exportActions={[]}
                    transformerColumns={{
                        created_at: (column) => ({
                            ...column,
                            cell: ({ row }) => formatWithBrowserTimezone(row.original.created_at),
                        }),
                    }}
                />
                {/* <DataGrid
                    rows={asset_categories?.data || []}
                    columns={columns}
                    tableState={tableState}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={asset_categories?.meta?.total || 0}
                    enableRowSelection={false}
                    rowId={(row) => row.id.toString()}
                    serverSide={true}
                    onSortingChange={handleSortingChange}
                    onGlobalFilterChange={handleFilterChange}
                    onPaginationChange={handlePaginationChange}
                    actionsRow={() => [
                        ...(can('asset_category.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('asset_category.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('asset_category.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ]}
                    emptyText="No data asset category available"
                /> */}

                <AssetCategoryDetailPage
                    assetCategory={assetCategorySelected}
                    ref={assetCategoryDetailPageRef}
                    onClose={() => setAssetCategorySelected(null)}
                />
                <AssetCategoryUpdatePage
                    assetCategory={assetCategorySelected}
                    ref={assetCategoryUpdatePageRef}
                    onClose={() => setAssetCategorySelected(null)}
                />
            </AppContainer>
        </AppLayout>
    );
};

export default AssetCategoryListPage;
