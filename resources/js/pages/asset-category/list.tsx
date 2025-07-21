import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid, DataGridState } from '@/components/data-grid';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import useDidUpdate from '@/hooks/use-did-update';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { spatieToTanstackState, tanstackToSpatieParams } from '@/lib/normalize-table-state';
import { SharedData } from '@/types';
import { AssetCategory, ResponseCollection, TableServerState } from '@/types/model';
import { router } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useCallback, useRef, useState } from 'react';
import { columns } from './column';
import AssetCategoryCreatePage from './create';
import AssetCategoryDetailPage from './detail';
import AssetCategoryUpdatePage, { AssetCategoryUpdatePageRef } from './edit';

const AssetCategoryListPage = () => {
    const {
        props: { asset_categories, table },
        component,
    } = usePage<SharedData & { asset_categories: ResponseCollection<AssetCategory>; table: TableServerState }>();
    const [tableState, setTableState] = useState(spatieToTanstackState(table));
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();
    const assetCategoryUpdatePageRef = useRef<AssetCategoryUpdatePageRef>(null);
    const assetCategoryDetailPageRef = useRef<AssetCategoryUpdatePageRef>(null);
    const [assetCategorySelected, setAssetCategorySelected] = useState<AssetCategory | null>(null);

    const updateTableState = useCallback((tableState: DataGridState) => {
        const query = tanstackToSpatieParams(tableState);
        router.get(route('asset_category.index'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useDidUpdate(() => {
        updateTableState(tableState);
    }, [tableState]);

    const handlePaginationChange = useCallback(
        (pagination: PaginationState) => {
            setTableState((prev) => ({ ...prev, pagination }));
        },
        [setTableState],
    );

    const handleSortingChange = useCallback(
        (sorting: SortingState) => {
            setTableState((prev) => ({ ...prev, sorting }));
        },
        [setTableState],
    );

    const handleFilterChange = useCallback(
        (globalFilter: string) => {
            setTableState((prev) => ({
                ...prev,
                globalFilter,
                pagination: {
                    ...prev.pagination,
                    pageIndex: 0,
                },
            }));
        },
        [setTableState],
    );

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
                <DataGrid
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
                />

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
