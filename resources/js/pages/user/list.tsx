import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid, type DataGridState } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import useDidUpdate from '@/hooks/use-did-update';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/lib/confirmDialog';
import { UserRoleStyle } from '@/lib/userRoleStyle';
import { SharedData } from '@/types';
import type { User } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import UserCreatePage from './create';
import UserDetailPage, { UserDetailPageRef } from './detail';
import UserUpdatePage, { UserUpdatePageRef } from './update';
import { DataTable, DataTableResource } from '@/components/data-table';
import { formatWithBrowserTimezone } from '@/lib/date';

function UserListPage() {
    const {
        props: { users },
        component,
    } = usePage<SharedData & { users: DataTableResource<User>; }>();
    const userUpdateRef = useRef<UserUpdatePageRef>(null);
    const userDetailPage = useRef<UserDetailPageRef>(null);
    const [userSelected, setUserSelected] = useState<User | null>(null);
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();


    const handleUpdateRow = useCallback((row: User) => {
        setUserSelected(row);
        userUpdateRef.current?.open();
    }, []);

    const handleDeleteRow = useCallback((row: User) => {
        confirmDialog({
            title: 'Delete User',
            description: (
                <>
                    Are you sure you want to delete user <b>{row.email}</b> This action cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: true,
            onConfirm: () => {
                router.delete(route('user.destroy', row.id), {
                    preserveScroll: true,
                });
            },
        });
    }, []);

    const handleViewDetail = useCallback((row: User) => {
        setUserSelected(row);
        userDetailPage.current?.open();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle title="Users" subtitle="List of all users" actions={<>{can('user.create') && <UserCreatePage />}</>} />

                <DataTable
                    resource={users}
                    bulkActions={[]}
                    exportActions={[]}
                    actionsRow={() => [
                        ...(can('user.view') ? [{ name: 'View', event: handleViewDetail }] : []),
                        ...(can('user.update') ? [{ name: 'Edit', event: handleUpdateRow }] : []),
                        ...(can('user.delete') ? [{ name: 'Delete', color: 'destructive', event: handleDeleteRow }] : []),
                    ]}
                    transformerColumns={{
                        'roles.name': (column) => ({
                            ...column,
                            cell: ({ row }) => {
                                return (
                                    <div className="flex flex-wrap gap-1">
                                        {row.original.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                intent={UserRoleStyle.getIntent(role.name) as any}
                                                variant="fill"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                );
                            },
                        }),
                        created_at: (columns) => ({
                            ...columns,
                            cell: ({ row }) => {
                                return formatWithBrowserTimezone(row.original.created_at);
                            },
                        }),
                    }}
                />

                <UserUpdatePage user={userSelected} ref={userUpdateRef} onClose={() => setUserSelected(null)} />
                <UserDetailPage user={userSelected} ref={userDetailPage} onClose={() => setUserSelected(null)} />
            </AppContainer>
        </AppLayout>
    );
}

export default UserListPage;
