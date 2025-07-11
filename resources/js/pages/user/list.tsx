import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { Badge } from '@/components/ui/badge';
import { DataGrid, type DataGridState } from '@/components/data-grid';
import AppLayout from '@/layouts/app-layout';
import { spatieToTanstackState, tanstackToSpatieParams } from '@/lib/normalize-table-state';
import { SharedData } from '@/types';
import type { ResponseCollection, TableServerState, User } from '@/types/model';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useCallback, useRef, useState } from 'react';
import UserCreatePage from './create';
import { UserRoleStyle } from '@/lib/userRoleStyle';
import UserUpdatePage, { UserUpdatePageRef } from './update';
import { confirmDialog } from '@/lib/confirmDialog';
import { toast } from 'sonner';
import useDidUpdate from '@/hooks/use-did-update';
import UserDetailPage, { UserDetailPageRef } from './detail';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';

function UserListPage() {
    const { props: { user, table }, component } = usePage<SharedData & { user: ResponseCollection<User>; table: TableServerState }>();
    const [tableState, setTableState] = useState(spatieToTanstackState(table));
    const userUpdateRef = useRef<UserUpdatePageRef>(null);
    const userDetailPage = useRef<UserDetailPageRef>(null);
    const [userSelected, setUserSelected] = useState<User | null>(null);
    const breadcrumbs = useBreadcrumb(component)
    const { can } = usePermission()

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }) => {
                return (
                    <div className="flex flex-wrap gap-1">
                        {row.original.roles.map((role) => (
                            <Badge key={role.id} intent={UserRoleStyle.getIntent(role.name) as any} variant="fill" size="sm" className="text-xs">
                                {role.name}
                            </Badge>
                        ))}
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ row }) => {
                return row.original.f_created_at
            }
        }
    ];


    const updateTableState = useCallback(
        (tableState: DataGridState) => {
            const query = tanstackToSpatieParams(tableState);
            router.get('/user', query, {
                preserveState: true,
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


    const handleUpdateRow = useCallback((row: User) => {
        setUserSelected(row);
        userUpdateRef.current?.open();
    }, [])

    const handleDeleteRow = useCallback((row: User) => {
        confirmDialog({
            title: 'Delete User',
            description: <>Are you sure you want to delete user <b>{row.email}</b> This action cannot be undone.</>,
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('user.destroy', row.id), {
                    preserveScroll: true,
                    onSuccess: (res) => {
                        if (res.props.success) {
                            toast.success((res.props.success as any).message);
                        }
                    },
                    onError: (errors) => {
                        if (errors.message) {
                            toast.error(errors.message, {
                                ...(errors.error ? { description: errors.error } : {}),
                            });
                        }
                    }
                })
            }
        })
    }, [])

    const handleViewDetail = useCallback((row: User) => {
        setUserSelected(row);
        userDetailPage.current?.open();
    }, [])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Users"
                    subtitle="List of all users"
                    actions={
                        <>
                            {can('user.create') && <UserCreatePage />}
                        </>
                    }
                />
                <DataGrid
                    rows={user?.data || []}
                    columns={columns}
                    tableState={tableState}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={user?.meta?.total || 0}
                    rowId={(row) => row.id.toString()}
                    serverSide={true}
                    emptyText="No data user available"
                    onSortingChange={handleSortingChange}
                    onGlobalFilterChange={handleFilterChange}
                    onPaginationChange={handlePaginationChange}
                    actionsRow={() => ([
                        ...(can('user.view') ? [{ name: 'View', event: handleViewDetail }] : []),
                        ...(can('user.update') ? [{ name: 'Edit', event: handleUpdateRow }] : []),
                        ...(can('user.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDeleteRow }] : []),
                    ])}
                />

                <UserUpdatePage user={userSelected} ref={userUpdateRef} onClose={() => setUserSelected(null)} />
                <UserDetailPage user={userSelected} ref={userDetailPage} onClose={() => setUserSelected(null)} />
            </AppContainer>
        </AppLayout>
    );
}

export default UserListPage;
