import AppContainer from "@/components/app-container";
import AppTitle from "@/components/app-title";
import { DataGrid, DataGridState } from "@/components/data-grid";
import { Badge } from "@/components/ui/badge";
import useDidUpdate from "@/hooks/use-did-update";
import AppLayout from "@/layouts/app-layout";
import { spatieToTanstackState, tanstackToSpatieParams } from "@/lib/normalize-table-state";
import { UserRoleStyle } from "@/lib/userRoleStyle";
import { BreadcrumbItem, SharedData } from "@/types";
import { ResponseCollection, Role, TableServerState } from "@/types/model";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { confirmDialog } from "@/lib/confirmDialog";
import { toast } from "sonner";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { usePermission } from "@/hooks/use-permissions";

const RoleListPage = () => {
    const { props: { roles, table, success, errors }, component } = usePage<SharedData & { roles: ResponseCollection<Role>; table: TableServerState }>()
    const [tableState, setTableState] = useState(spatieToTanstackState(table));
    const breadcrumbs = useBreadcrumb(component)
    const { can } = usePermission()

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                return (
                    <Badge intent={UserRoleStyle.getIntent(row.original.name) as any} variant="fill" size="sm" className="text-xs">
                        {row.original.name}
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'total_permissions',
            header: 'Permissions'
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
        }
    ];
    const updateTableState = useCallback(
        (tableState: DataGridState) => {
            const query = tanstackToSpatieParams(tableState);
            router.get(route('role.index'), query, {
                preserveState: true,
            });
        },
        [],
    );

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

    const handleView = (row: Role) => {
        router.visit(route('role.show', { role: row.id }));
    };

    const handleEdit = (row: Role) => {
        router.visit(route('role.edit', { role: row.id }));
    };

    const handleDelete = (row: Role) => {
        confirmDialog({
            title: 'Delete role',
            description: <>Are you sure you want to delete role <b>{row.name}</b> This action cannot be undone.</>,
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('role.destroy', row.id), {
                    preserveScroll: true
                })
            }
        })
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
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

                <DataGrid
                    rows={roles?.data || []}
                    columns={columns}
                    tableState={tableState}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={roles?.meta?.total || 0}
                    rowId={(row) => row.id.toString()}
                    serverSide={true}
                    emptyText="No data roles available"
                    onSortingChange={handleSortingChange}
                    onGlobalFilterChange={handleFilterChange}
                    onPaginationChange={handlePaginationChange}
                    actionsRow={() => ([
                        ...(can('role.view') ? [{ name: 'View', event: handleView }] : []),
                        ...(can('role.update') ? [{ name: 'Edit', event: handleEdit }] : []),
                        ...(can('role.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDelete }] : []),
                    ])}
                />
            </AppContainer>
        </AppLayout>
    )
}

export default RoleListPage
