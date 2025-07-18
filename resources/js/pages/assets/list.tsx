import AppContainer from '@/components/app-container'
import AppTitle from '@/components/app-title'
import { DataGrid, useTableResolver } from '@/components/data-grid'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import AppLayout from '@/layouts/app-layout'
import { SharedData } from '@/types'
import { Asset, ResponseCollection } from '@/types/model'
import { router, usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { confirmDialog } from '@/lib/confirmDialog'
import useDidUpdate from '@/hooks/use-did-update'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { usePermission } from '@/hooks/use-permissions'
import { TableServer } from '@/types/table'
import { columns as TableColumns } from './column'

const AssetListPage = () => {
    const { can } = usePermission()
    const { component, props: { assets, table, success, errors } } = usePage<SharedData & { assets: ResponseCollection<Asset>, table: TableServer<Asset> }>()
    const breadcrumbs = useBreadcrumb(component)
    const { tableState, setTableState, columns, tableStateServer } = useTableResolver(table, TableColumns)

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
    }

    const handleDelete = (row: Asset) => {
        confirmDialog({
            title: 'Delete asset',
            description: <>Are you sure you want to delete asset <b>{row.name}</b> This action cannot be undone.</>,
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('asset.destroy', row.id), {
                    preserveScroll: true,
                    preserveState: true,
                })
            }
        })
    };

    const updateTableState = useCallback(
        (tableState: Record<string, string>) => {
            const query = tableState;
            router.get(route('asset.index'), query, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [tableStateServer],
    );

    useDidUpdate(() => {
        updateTableState(tableStateServer);
    }, [tableStateServer])

    const handlePaginationChange = useCallback((pagination: PaginationState) => {
        setTableState(prev => ({ ...prev, pagination }))
    }, [setTableState]);

    const handleSortingChange = useCallback((sorting: SortingState) => {
        setTableState(prev => ({ ...prev, sorting }))
    }, [setTableState]);

    const handleFilterChange = useCallback((globalFilter: string) => {
        setTableState(prev => ({
            ...prev,
            globalFilter,
            pagination: {
                ...prev.pagination,
                pageIndex: 0,
            }
        }));
    }, [setTableState])

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
                <DataGrid
                    rows={assets?.data || []}
                    columns={columns}
                    tableState={tableState}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={assets?.meta?.total || 0}
                    rowId={(row) => row.id ? row.id.toString() : ''}
                    serverSide={true}
                    emptyText="No data assets available"
                    onSortingChange={handleSortingChange}
                    onGlobalFilterChange={handleFilterChange}
                    onPaginationChange={handlePaginationChange}
                    actionsRow={() => ([
                        ...(can('asset.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('asset.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('asset.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ])}
                />
            </AppContainer>
        </AppLayout>
    )
}

export default AssetListPage
