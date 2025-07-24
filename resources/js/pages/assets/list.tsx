import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid, DataGridState, useTableResolver } from '@/components/data-grid';
import SkeletonDataGrid from '@/components/skeleton/skeleton-data-grid';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { tanstackToSpatieParams } from '@/lib/normalize-table-state';
import { SharedData } from '@/types';
import { Asset, ResponseCollection } from '@/types/model';
import { TableServer } from '@/types/table';
import { Page } from '@inertiajs/core';
import { router, usePage, WhenVisible } from '@inertiajs/react';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns as TableColumns } from './column';

const AssetListPage = () => {
    const { can } = usePermission();
    const {
        component,
        props: { success, errors },
    } = usePage<SharedData>();
    const breadcrumbs = useBreadcrumb(component);
    const [assets, setAsssets] = useState<ResponseCollection<Asset> | undefined>(undefined);
    const { setTable, columns, tableState, setTableState, tableStateServer } = useTableResolver('assets-table', TableColumns);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (success) {
            toast.success((success as any).message as any);
        }
        if (errors) {
            if (errors.message) {
                toast.error(errors.message, {
                    ...(errors.error ? { description: errors.error } : {}),
                });
            }
        }
    }, [success, errors]);

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

    const updateDataTable = (query: DataGridState) => {
        router.get(route('asset.index'), tanstackToSpatieParams(query), {
            preserveUrl: true,
            preserveState: true,
            preserveScroll: true,
            only: ['assets'],
            async: true,
            onStart: () => {
                setIsLoading(true);
            },
            onSuccess: (data) => {
                const typedData = data as Page<SharedData & { assets: ResponseCollection<Asset>; table: TableServer<Asset> }>;
                setAsssets(typedData.props.assets);
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const updateTableState = useCallback(
        (partialState: Partial<DataGridState>) => {
            setTableState((prevState) => {
                const newState = { ...prevState, ...partialState };
                updateDataTable(newState);
                return newState;
            });
        },
        [setTableState],
    );

    const handlePaginationChange = useCallback((pagination: PaginationState) => {
        updateTableState({ pagination });
    }, []);

    const handleSortingChange = useCallback((sorting: SortingState) => {
        updateTableState({ sorting });
    }, []);

    const handleFilterChange = useCallback((globalFilter: string) => {
        updateTableState({ globalFilter });
    }, []);

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
                <WhenVisible
                    params={{
                        method: 'get',
                        data: {
                            ...(tableState ? tableStateServer : {}),
                        },
                        only: ['assets', 'table'],
                        preserveUrl: true,
                        async: true,
                        onSuccess: (data) => {
                            const typedData = data as Page<SharedData & { assets: ResponseCollection<Asset>; table: TableServer<Asset> }>;
                            setAsssets(typedData.props.assets);
                            setTable(typedData.props.table);
                        },
                    }}
                    fallback={<SkeletonDataGrid />}
                >
                    <DataGrid
                        rows={assets?.data || []}
                        columns={columns}
                        tableState={{
                            ...tableState,
                            sorting: tableState?.sorting || [{ id: 'created_at', desc: true }],
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        isLoading={isLoading}
                        rowCount={assets?.meta?.total || 0}
                        rowId={(row) => (row.id ? row.id.toString() : '')}
                        serverSide={true}
                        emptyText="No data assets available"
                        onSortingChange={handleSortingChange}
                        onGlobalFilterChange={handleFilterChange}
                        onPaginationChange={handlePaginationChange}
                        actionsRow={() => [
                            ...(can('asset.view') ? [{ name: 'View', event: handleView }] : []),
                            ...(can('asset.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                            ...(can('asset.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                        ]}
                    />
                </WhenVisible>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetListPage;
