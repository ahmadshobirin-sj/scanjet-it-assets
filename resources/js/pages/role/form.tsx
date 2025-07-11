import AppContainer from '@/components/app-container'
import AppTitle from '@/components/app-title'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormMessage } from '@/components/ui/form-message'
import { GroupFormField, GroupFormItem } from '@/components/ui/group-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import AppLayout from '@/layouts/app-layout'
import { camelCaseToWords } from '@/lib/utils'
import { SharedData } from '@/types'
import { Permission, ResponseCollection, ResponseResource, Role } from '@/types/model'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { CheckedState } from '@radix-ui/react-checkbox'
import { SquarePen } from 'lucide-react'
import { FC, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

interface RoleFormPageProps {
    viewType: 'create' | 'update' | 'detail';
}

const RoleFormPage: FC<RoleFormPageProps> = ({ viewType }) => {
    const { props: { permissions, role }, component } = usePage<SharedData & { permissions: ResponseCollection<Permission>, role?: ResponseResource<Role> }>()
    const breadcrumbs = useBreadcrumb(component)

    const { data, setData, post, put, processing, errors, reset, isDirty, setDefaults } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: '',
        permissions: []
    });

    useBeforeUnloadPrompt(isDirty)

    useEffect(() => {
        if (viewType !== 'create' && role) {
            setDefaults('name', role.data.name);
            setData('name', role.data.name);
            setDefaults('permissions', role.data.permissions.map((permission) => permission.id));
            setData('permissions', role.data.permissions.map((permission) => permission.id));
        }
    }, [viewType, role])

    const titlePage = useMemo(() => {
        if (viewType === 'detail') return 'Role Detail';
        if (viewType === 'update') return 'Update Role';
        return 'Create Role';
    }, [viewType]);

    const subTitlePage = useMemo(() => {
        if (viewType === 'detail') return 'View role details and permissions.';
        if (viewType === 'update') return 'Update role details and permissions.';
        return 'Create a new role by providing its name and permissions.';
    }, [viewType]);

    const groupData = (permissions: Permission[]) => {
        const groups: {
            name: string;
            permissions: { id: string; name: string }[];
        }[] = [];
        for (const permission of permissions) {
            const splitPermission = permission.name.split('.');
            const groupName = splitPermission[0];
            const permissionPrefix = camelCaseToWords(splitPermission[splitPermission.length - 1]);
            const group = groups.find((g) => g.name === groupName);
            if (!group) {
                groups.push({
                    name: groupName,
                    permissions: [{ id: permission.id, name: permissionPrefix }],
                });
            } else {
                group.permissions.push({ id: permission.id, name: permissionPrefix });
            }
        }
        return groups;
    };

    const permissionsGrouped = useMemo(() => {
        if (permissions) {
            const grouped = groupData(permissions.data)
            return grouped
        }
        return []
    }, [permissions]);

    const allPermissionChecked = useMemo(() => {
        if (data.permissions.length === 0) return false;
        if (data.permissions.length === permissions.data.length) return true;
        return false;
    }, [data.permissions, permissions]);

    const onAllPermissionChecked = (value: Boolean) => {
        if (value) {
            setData('permissions', permissions.data.map((permission) => permission.id));
        } else {
            setData('permissions', []);
        }
    };

    const roleChecked = (name: string) => {
        const role = permissionsGrouped.find((role) => role.name === name);
        if (!role) return false;

        const permissionIds = role.permissions.map((p) => p.id);
        const checkedPermissions = permissionIds.filter((id) => data.permissions.includes(id));

        if (checkedPermissions.length === 0) return false;
        if (checkedPermissions.length === permissionIds.length) return true;
        return 'indeterminate';
    };

    const onRoleChecked = (value: CheckedState, name: string) => {
        const role = permissionsGrouped.find((role) => role.name === name);
        if (!role) return;
        if (value) {
            setData('permissions', [...data.permissions, ...role.permissions.map((val) => val.id)])
        } else {
            setData('permissions', data.permissions.filter((permission) => {
                return !role?.permissions.some((val) => val.id === permission);
            }))
        }
    };

    const handleChangePermission = (value: CheckedState, permissionId: string) => {
        if (value) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter((id) => id !== permissionId));
        }
    };

    const postRole = () => {
        post(route('role.store'), {
            preserveScroll: true,
            preserveState: true,
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message, {
                        ...(errors.error ? { description: errors.error } : {}),
                    })
                }
            }
        });
    }

    const updateRole = () => {
        put(route('role.update', { role: role?.data.id }), {
            preserveScroll: true,
            preserveState: true,
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message, {
                        ...(errors.error ? { description: errors.error } : {}),
                    })
                }
            }
        });
    }


    const handleSubmit = () => {
        if (viewType === 'create') {
            postRole();
        }
        if (viewType === 'update') {
            updateRole();
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={titlePage} />
            <AppContainer className="space-y-6">
                <AppTitle
                    title={titlePage}
                    subtitle={subTitlePage}
                    actions={
                        <>
                            {
                                viewType === 'detail' ? (
                                    <Button variant="fill" intent="warning" leading={<SquarePen />} onClick={() => router.visit(route('role.edit', { role: role?.data.id }))}>
                                        Edit role
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => router.visit(route('role.index'))}>
                                        Cancel
                                    </Button>
                                )
                            }
                            {
                                viewType !== 'detail' && (
                                    <>
                                        <Button onClick={() => reset()} intent="warning">Reset</Button>
                                        <Button onClick={handleSubmit} loading={processing}>
                                            Save
                                        </Button>
                                    </>
                                )
                            }
                        </>
                    }
                />
                <div>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <GroupFormItem>
                            <GroupFormField>
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    disabled={viewType === 'detail'}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter role name"
                                    className="w-full"
                                />
                            </GroupFormField>
                            {
                                errors.name && <FormMessage error>{errors.name}</FormMessage>
                            }
                        </GroupFormItem>
                        <GroupFormItem>
                            <GroupFormField direction="row">
                                <Switch disabled={viewType === 'detail'} intent="primary" id="select-all" size="lg" checked={allPermissionChecked} onCheckedChange={onAllPermissionChecked} />
                                <Label htmlFor="select-all">Select All</Label>
                            </GroupFormField>
                            <FormMessage>
                                Enables/Disables all Permissions for this role
                            </FormMessage>
                        </GroupFormItem>
                    </div>
                    <div className="mt-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {
                                permissionsGrouped.map((group, index) => (
                                    <div className="rounded-md border px-4" key={index}>
                                        <div className="flex items-center justify-between gap-2 border-b py-2 capitalize">
                                            <span className="font-semibold">{group.name}</span>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`input-${group.name}`}>Select All</Label>
                                                <Checkbox
                                                    id={`input-${group.name}`}
                                                    disabled={viewType === 'detail'}
                                                    checked={roleChecked(group.name)}
                                                    onCheckedChange={(value) => onRoleChecked(value, group.name)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 py-4">
                                            {
                                                group.permissions.map((permission) => (
                                                    <GroupFormField key={permission.id} direction="row">
                                                        <Checkbox
                                                            id={`permission-${permission.name}`}
                                                            disabled={viewType === 'detail'}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onCheckedChange={(value) => handleChangePermission(value, permission.id)}
                                                        />
                                                        <Label htmlFor={`permission-${permission.name}`} className="capitalize font-normal">{permission.name}</Label>
                                                    </GroupFormField>
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </AppContainer>
        </AppLayout>
    )
}

export default RoleFormPage
