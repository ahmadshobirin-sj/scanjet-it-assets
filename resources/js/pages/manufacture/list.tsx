import AppContainer from '@/components/app-container'
import AppTitle from '@/components/app-title'
import { DataGrid, DataGridState } from '@/components/data-grid'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { usePermission } from '@/hooks/use-permissions'
import AppLayout from '@/layouts/app-layout'
import { spatieToTanstackState, tanstackToSpatieParams } from '@/lib/normalize-table-state'
import { SharedData } from '@/types'
import { Manufacture, ResponseCollection, TableServerState } from '@/types/model'
import { router, usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { columns } from './column'
import { confirmDialog } from '@/lib/confirmDialog'
import useDidUpdate from '@/hooks/use-did-update'
import { PaginationState, SortingState } from '@tanstack/react-table'

const ManufactureListPage = () => {
    const { props: { manufactures, table, success, errors }, component } = usePage<SharedData & { manufactures: ResponseCollection<Manufacture>; table: TableServerState }>()
    const [tableState, setTableState] = useState(spatieToTanstackState(table));
    const breadcrumbs = useBreadcrumb(component)
    const { can } = usePermission()


    // Toast notification for success or error messages
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

    const handleView = (row: Manufacture) => {
        router.visit(route('manufacture.show', { manufacture: row.id }));
    };

    const handleEdit = (row: Manufacture) => {
        router.visit(route('manufacture.edit', { manufacture: row.id }));
    }

    const handleDelete = (row: Manufacture) => {
        confirmDialog({
            title: 'Delete manufacture',
            description: <>Are you sure you want to delete manufacture <b>{row.name}</b> This action cannot be undone.</>,
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('manufacture.destroy', row.id), {
                    preserveScroll: true,
                    preserveState: true,
                })
            }
        })
    };


    const updateTableState = useCallback(
        (tableState: DataGridState) => {
            const query = tanstackToSpatieParams(tableState);
            router.get(route('manufacture.index'), query, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [],
    );

    useDidUpdate(() => {
        updateTableState(tableState);
    }, [tableState])

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
                    title="Manufactures"
                    subtitle="List of all manufactures"
                    actions={
                        <>
                            {can('manufacture.create') && (
                                <Button
                                    leading={<Plus />}
                                    onClick={() => router.visit(route('manufacture.create'))}
                                >
                                    Create manufacture
                                </Button>
                            )}
                        </>
                    }
                />
                <DataGrid
                    rows={manufactures?.data || []}
                    columns={columns}
                    tableState={tableState}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={manufactures?.meta?.total || 0}
                    enableRowSelection={false}
                    rowId={(row) => row.id.toString()}
                    serverSide={true}
                    onSortingChange={handleSortingChange}
                    onGlobalFilterChange={handleFilterChange}
                    onPaginationChange={handlePaginationChange}
                    actionsRow={() => ([
                        ...(can('manufacture.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('manufacture.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('manufacture.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : [])
                    ])}
                    emptyText="No data manufactures available"
                />
            </AppContainer>
        </AppLayout>
    )
}

export default ManufactureListPage
